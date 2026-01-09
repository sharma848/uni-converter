import {
    IConverter,
    ConversionRequest,
    ConversionResult,
} from "../../types/IConverter.js";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { createWriteStream } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const combineImagesConverter: IConverter = {
    getName: () => "Combine Images",
    getDescription: () =>
        "Combine multiple images into one PDF or a single vertical image",

    async convert(request: ConversionRequest): Promise<ConversionResult> {
        const { files, options = {} } = request;
        const { outputType = "pdf", order } = options; // 'pdf' or 'image'

        if (!files || files.length === 0) {
            throw new Error("No files provided");
        }

        if (files.length < 2) {
            throw new Error("At least 2 images are required for combining");
        }

        const uploadsDir = path.join(__dirname, "../../../uploads");
        const outputsDir = path.join(__dirname, "../../../outputs");
        const fileOrder = order || files;

        if (outputType === "pdf") {
            // Combine into PDF (similar to ImageToPdfConverter)
            const pdfDoc = await PDFDocument.create();

            for (const filename of fileOrder) {
                if (!files.includes(filename)) {
                    continue;
                }

                const filePath = path.join(uploadsDir, filename);
                const fileExt = filename.toLowerCase().split('.').pop();
                
                // Use sharp streaming API for better memory efficiency
                let pngBuffer: Buffer;
                try {
                    if (fileExt === 'heic' || fileExt === 'heif') {
                        // HEIC files require special handling
                        pngBuffer = await sharp(filePath, {
                            limitInputPixels: false,
                            failOnError: true,
                        }).png().toBuffer();
                    } else {
                        pngBuffer = await sharp(filePath, {
                            limitInputPixels: false,
                        }).png().toBuffer();
                    }

                    const image = await pdfDoc.embedPng(pngBuffer);
                    const { width, height } = image.scale(1);

                    const pageWidth = 595;
                    const pageHeight = 842;
                    const scale = Math.min(pageWidth / width, pageHeight / height);
                    const scaledWidth = width * scale;
                    const scaledHeight = height * scale;
                    const x = (pageWidth - scaledWidth) / 2;
                    const y = (pageHeight - scaledHeight) / 2;

                    const page = pdfDoc.addPage([pageWidth, pageHeight]);
                    page.drawImage(image, {
                        x,
                        y,
                        width: scaledWidth,
                        height: scaledHeight,
                    });
                    
                    // Clear buffer reference to help GC
                    pngBuffer.fill(0);
                } catch (error: any) {
                    if (fileExt === 'heic' || fileExt === 'heif') {
                        if (error.message?.includes('corrupt') || error.message?.includes('heif')) {
                            throw new Error(
                                `HEIC file "${filename}" appears to be corrupted or incompatible. ` +
                                `Please try converting it to JPG/PNG first. ` +
                                `Original error: ${error.message}`
                            );
                        }
                        throw new Error(
                            `Failed to process HEIC file "${filename}": ${error.message}`
                        );
                    }
                    throw error;
                }
            }

            const pdfBytes = await pdfDoc.save();
            const outputFilename = `combined-images-${Date.now()}.pdf`;
            const outputPath = path.join(outputsDir, outputFilename);

            // Write in chunks for large files
            if (pdfBytes.length > 10 * 1024 * 1024) {
                const chunkSize = 1024 * 1024;
                const writeStream = createWriteStream(outputPath);
                
                for (let i = 0; i < pdfBytes.length; i += chunkSize) {
                    const chunk = pdfBytes.slice(i, i + chunkSize);
                    await new Promise<void>((resolve, reject) => {
                        writeStream.write(chunk, (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }
                writeStream.end();
                await new Promise<void>((resolve, reject) => {
                    writeStream.on('finish', resolve);
                    writeStream.on('error', reject);
                });
            } else {
                await fs.writeFile(outputPath, pdfBytes);
            }

            return {
                outputFile: outputFilename,
                outputPath: `/outputs/${outputFilename}`,
                size: pdfBytes.length,
                metadata: {
                    imageCount: files.length,
                    outputType: "pdf",
                },
            };
        } else {
            // Combine into single vertical image
            const images: { buffer: Buffer; metadata: sharp.Metadata }[] = [];

            for (const filename of fileOrder) {
                if (!files.includes(filename)) {
                    continue;
                }

                const filePath = path.join(uploadsDir, filename);
                const fileExt = filename.toLowerCase().split('.').pop();
                
                // Use sharp streaming API - toBuffer() is memory efficient for large images
                let image: sharp.Sharp;
                let metadata: sharp.Metadata;
                let buffer: Buffer;
                
                try {
                    if (fileExt === 'heic' || fileExt === 'heif') {
                        image = sharp(filePath, {
                            limitInputPixels: false,
                            failOnError: true,
                        });
                    } else {
                        image = sharp(filePath, {
                            limitInputPixels: false,
                        });
                    }
                    metadata = await image.metadata();
                    buffer = await image.toBuffer();

                    images.push({ buffer, metadata: metadata! });
                } catch (error: any) {
                    if (fileExt === 'heic' || fileExt === 'heif') {
                        if (error.message?.includes('corrupt') || error.message?.includes('heif')) {
                            throw new Error(
                                `HEIC file "${filename}" appears to be corrupted or incompatible. ` +
                                `Please try converting it to JPG/PNG first. ` +
                                `Original error: ${error.message}`
                            );
                        }
                        throw new Error(
                            `Failed to process HEIC file "${filename}": ${error.message}`
                        );
                    }
                    throw error;
                }
            }

            // Calculate dimensions
            const maxWidth = Math.max(
                ...images.map((img) => img.metadata.width || 0)
            );
            const totalHeight = images.reduce(
                (sum, img) => sum + (img.metadata.height || 0),
                0
            );

            // Create combined image
            const combinedImage = sharp({
                create: {
                    width: maxWidth,
                    height: totalHeight,
                    channels: 4,
                    background: { r: 255, g: 255, b: 255, alpha: 1 },
                },
            });

            let currentY = 0;
            const composites = images.map((img) => {
                const composite = {
                    input: img.buffer,
                    top: currentY,
                    left: Math.floor(
                        (maxWidth - (img.metadata.width || 0)) / 2
                    ),
                };
                currentY += img.metadata.height || 0;
                return composite;
            });

            const outputBuffer = await combinedImage
                .composite(composites)
                .png()
                .toBuffer();

            const outputFilename = `combined-images-${Date.now()}.png`;
            const outputPath = path.join(outputsDir, outputFilename);

            // Write in chunks for very large images
            if (outputBuffer.length > 10 * 1024 * 1024) {
                const chunkSize = 1024 * 1024;
                const writeStream = createWriteStream(outputPath);
                
                for (let i = 0; i < outputBuffer.length; i += chunkSize) {
                    const chunk = outputBuffer.slice(i, i + chunkSize);
                    await new Promise<void>((resolve, reject) => {
                        writeStream.write(chunk, (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }
                writeStream.end();
                await new Promise<void>((resolve, reject) => {
                    writeStream.on('finish', resolve);
                    writeStream.on('error', reject);
                });
            } else {
                await fs.writeFile(outputPath, outputBuffer);
            }

            return {
                outputFile: outputFilename,
                outputPath: `/outputs/${outputFilename}`,
                size: outputBuffer.length,
                metadata: {
                    imageCount: files.length,
                    outputType: "image",
                    width: maxWidth,
                    height: totalHeight,
                },
            };
        }
    },
};

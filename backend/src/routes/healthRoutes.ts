import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadsDir = path.join(__dirname, "../../uploads");
const outputsDir = path.join(__dirname, "../../outputs");

const startTime = Date.now();

// Basic health check endpoint
router.get("/", async (req, res) => {
    try {
        const uptime = Math.floor((Date.now() - startTime) / 1000);
        const memoryUsage = process.memoryUsage();

        // Check if directories are accessible
        let uploadsAccessible = false;
        let outputsAccessible = false;

        try {
            await fs.access(uploadsDir);
            uploadsAccessible = true;
        } catch (error) {
            // Directory might not exist or not accessible
        }

        try {
            await fs.access(outputsDir);
            outputsAccessible = true;
        } catch (error) {
            // Directory might not exist or not accessible
        }

        const healthStatus = {
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: uptime,
            uptimeFormatted: formatUptime(uptime),
            environment: process.env.NODE_ENV || "development",
            version: process.env.npm_package_version || "1.0.0",
            memory: {
                rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(
                    memoryUsage.heapTotal / 1024 / 1024
                )}MB`,
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
                external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
            },
            system: {
                platform: os.platform(),
                arch: os.arch(),
                nodeVersion: process.version,
                cpuCount: os.cpus().length,
            },
            directories: {
                uploads: uploadsAccessible ? "accessible" : "not accessible",
                outputs: outputsAccessible ? "accessible" : "not accessible",
            },
        };

        // If critical directories are not accessible, return 503
        if (!uploadsAccessible || !outputsAccessible) {
            return res.status(503).json({
                ...healthStatus,
                status: "degraded",
                message: "Some directories are not accessible",
            });
        }

        res.json(healthStatus);
    } catch (error: any) {
        res.status(500).json({
            status: "error",
            timestamp: new Date().toISOString(),
            error: error.message || "Unknown error",
        });
    }
});

// Simple liveness probe (for Kubernetes/Docker)
router.get("/live", (req, res) => {
    res.json({ status: "alive", timestamp: new Date().toISOString() });
});

// Readiness probe (checks if service is ready to accept traffic)
router.get("/ready", async (req, res) => {
    try {
        // Check if critical directories exist and are writable
        let uploadsReady = false;
        let outputsReady = false;

        try {
            await fs.access(uploadsDir);
            uploadsReady = true;
        } catch (error) {
            // Try to create directory
            try {
                await fs.mkdir(uploadsDir, { recursive: true });
                uploadsReady = true;
            } catch (mkdirError) {
                uploadsReady = false;
            }
        }

        try {
            await fs.access(outputsDir);
            outputsReady = true;
        } catch (error) {
            // Try to create directory
            try {
                await fs.mkdir(outputsDir, { recursive: true });
                outputsReady = true;
            } catch (mkdirError) {
                outputsReady = false;
            }
        }

        if (uploadsReady && outputsReady) {
            res.json({
                status: "ready",
                timestamp: new Date().toISOString(),
                directories: {
                    uploads: "ready",
                    outputs: "ready",
                },
            });
        } else {
            res.status(503).json({
                status: "not ready",
                timestamp: new Date().toISOString(),
                directories: {
                    uploads: uploadsReady ? "ready" : "not ready",
                    outputs: outputsReady ? "ready" : "not ready",
                },
            });
        }
    } catch (error: any) {
        res.status(503).json({
            status: "not ready",
            timestamp: new Date().toISOString(),
            error: error.message || "Unknown error",
        });
    }
});

// Helper function to format uptime
function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m ${secs}s`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

export { router as healthRouter };

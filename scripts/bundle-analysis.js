#!/usr/bin/env node
/**
 * Bundle size analysis — measures individual component sizes.
 * Usage: node scripts/bundle-analysis.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const REACT_SRC = path.join(__dirname, "..", "packages", "react", "src");
const LIMITS = {
	Button: 5120, // 5KB
	Modal: 8192, // 8KB
	Tabs: 6144, // 6KB
	Input: 4096, // 4KB
	Card: 3072, // 3KB
	Alert: 3072, // 3KB
	Accordion: 6144, // 6KB
	Tooltip: 4096, // 4KB
};

async function analyzeBundle() {
	// Check if esbuild is available
	try {
		require.resolve("esbuild");
	} catch {
		console.log("esbuild not found, using size estimation from built output");
		return estimateFromBuild();
	}

	const esbuild = require("esbuild");
	const results = [];

	// Find all component entry points
	const componentsDir = path.join(REACT_SRC, "components");
	if (!fs.existsSync(componentsDir)) {
		console.log("Components directory not found at", componentsDir);
		console.log("Checking alternative locations...");
		// Try to find components
		const srcFiles = fs.existsSync(REACT_SRC) ? fs.readdirSync(REACT_SRC) : [];
		console.log("Files in src:", srcFiles);
		return;
	}

	const components = fs
		.readdirSync(componentsDir)
		.filter((f) =>
			fs.statSync(path.join(componentsDir, f)).isDirectory(),
		);

	for (const component of components) {
		const entryPoints = [
			"index.tsx",
			"index.ts",
			`${component}.tsx`,
			`${component}.ts`,
		];
		let entry = null;
		for (const ep of entryPoints) {
			const fullPath = path.join(componentsDir, component, ep);
			if (fs.existsSync(fullPath)) {
				entry = fullPath;
				break;
			}
		}
		if (!entry) continue;

		try {
			const result = await esbuild.build({
				entryPoints: [entry],
				bundle: true,
				write: false,
				minify: true,
				format: "esm",
				external: ["react", "react-dom"],
				metafile: true,
			});

			const size = result.outputFiles[0].contents.length;
			const limit = LIMITS[component] || 10240; // 10KB default
			const status = size <= limit ? "PASS" : "FAIL";
			results.push({ component, size, limit, status });
		} catch (err) {
			results.push({
				component,
				size: 0,
				limit: 0,
				status: "ERROR",
				error: err.message,
			});
		}
	}

	// Print report
	console.log("\nBundle Size Analysis\n");
	console.log(
		"Component".padEnd(20) + "Size".padEnd(10) + "Limit".padEnd(10) + "Status",
	);
	console.log("-".repeat(50));
	for (const r of results) {
		const sizeStr = `${(r.size / 1024).toFixed(1)}KB`;
		const limitStr = `${(r.limit / 1024).toFixed(1)}KB`;
		console.log(
			r.component.padEnd(20) + sizeStr.padEnd(10) + limitStr.padEnd(10) + r.status,
		);
	}

	const failures = results.filter((r) => r.status === "FAIL");
	if (failures.length > 0) {
		console.log(`\n${failures.length} component(s) over budget`);
		process.exit(1);
	} else {
		console.log("\nAll components within budget");
	}
}

function estimateFromBuild() {
	// Fallback: check total build output size
	const distPath = path.join(__dirname, "..", "packages", "react", "dist");
	if (!fs.existsSync(distPath)) {
		console.log("No dist directory found. Run npm run build first.");
		return;
	}
	const files = fs.readdirSync(distPath);
	let totalJS = 0;
	let totalCSS = 0;
	for (const f of files) {
		const size = fs.statSync(path.join(distPath, f)).size;
		if (f.endsWith(".js") || f.endsWith(".mjs")) totalJS += size;
		if (f.endsWith(".css")) totalCSS += size;
	}
	console.log(`Total JS: ${(totalJS / 1024).toFixed(1)}KB (limit: 100KB)`);
	console.log(`Total CSS: ${(totalCSS / 1024).toFixed(1)}KB (limit: 30KB)`);
}

analyzeBundle().catch(console.error);

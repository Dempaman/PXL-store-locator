/* eslint-disable @typescript-eslint/no-require-imports */
const { cpSync, existsSync, mkdirSync } = require("node:fs")
const { join } = require("node:path")

const projectRoot = process.cwd()
const standaloneRoot = join(projectRoot, ".next", "standalone")
const standaloneNext = join(standaloneRoot, ".next")

if (!existsSync(standaloneRoot)) {
  console.error("Expected .next/standalone to exist. Run `next build` first.")
  process.exit(1)
}

if (!existsSync(standaloneNext)) {
  mkdirSync(standaloneNext, { recursive: true })
}

cpSync(join(projectRoot, ".next", "static"), join(standaloneNext, "static"), {
  recursive: true,
  force: true,
})

cpSync(join(projectRoot, "public"), join(standaloneRoot, "public"), {
  recursive: true,
  force: true,
})

console.log("Prepared standalone assets in .next/standalone")

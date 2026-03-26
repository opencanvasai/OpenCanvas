import * as dotenv from "dotenv";
dotenv.config(); // Force load before anything else runs

import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";


// Strict checks for signing AND notarization
if (!process.env.APPLE_SIGN_IDENTITY) throw new Error("ERROR: APPLE_SIGN_IDENTITY is missing.");
if (!process.env.APPLE_ID) throw new Error("ERROR: APPLE_ID is missing.");
if (!process.env.APPLE_APP_SPECIFIC_PASSWORD) throw new Error("ERROR: APPLE_APP_SPECIFIC_PASSWORD is missing.");
if (!process.env.APPLE_TEAM_ID) throw new Error("ERROR: APPLE_TEAM_ID is missing.");

const appleId = process.env.APPLE_ID;
const appleIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
const appleTeamId = process.env.APPLE_TEAM_ID;

const config: ForgeConfig = {
packagerConfig: {
    asar: true,
    executableName: "opencanvas",
    
   osxSign: {
      optionsForFile: (filePath) => {
        return {
          entitlements: "entitlements.plist",
          hardenedRuntime: true,
          signatureFlags: "library"
        };
      }
    },

    // Force notarization to run
    osxNotarize: {
      appleId: appleId,
      appleIdPassword: appleIdPassword,
      teamId: appleTeamId,
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerZIP({}, ["darwin"]),
    new MakerDMG({}),
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "Gyana491",
          name: "OpenCanvas",
        },
        draft: true,
        prerelease: false,
        generateReleaseNotes: true,
      },
    },
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: "src/main.ts",
          config: "vite.main.config.mts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.mts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.mts",
        },
      ],
    }),

    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: false,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
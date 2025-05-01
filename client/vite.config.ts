import { fileURLToPath, URL } from 'node:url';

import { defineConfig, PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import {DynamicPublicDirectory} from "vite-multiple-assets";

// https://vitejs.dev/config/
export default defineConfig (( { mode } ) =>
{
  let publicDirectories : Array<any> = ["public/**"];

  if ( mode === 'development' )
  {
    publicDirectories.push (
      {
        input: "../server/projectArchive/**",
        output: "/projectArchive",
        watch: false
      });
  }
  
  return {
    plugins:
    [
      vue (
      {
        template:
        {
          compilerOptions:
          {
            isCustomElement: tag => tag.startsWith("local-")
          }
        }
      }) as PluginOption,

      DynamicPublicDirectory
      (
        publicDirectories,
        {
          ssr: false
        }) as PluginOption
    ],

    publicDir: false, // This is instead handled by the "vite-multiple-assets" plugin

    resolve:
    {
      alias:
      {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },

    build:
    {
      outDir: '../server/dist/wwwroot'
    }
  }
});

// import {defineConfig, PluginOption} from 'vite'
// import vue from '@vitejs/plugin-vue'
// import {DynamicPublicDirectory} from "vite-multiple-assets";

// // https://vite.dev/config/
// export default defineConfig (
//   {
//     server:
//     {
//         port: 3003
//     },
//     preview:
//     {
//         port: 3004
//     },
//     plugins: 
//     [
//       vue(
//       {
//         template:
//         {
//             transformAssetUrls:
//             {
//                 img: [''],
//             }
//         }
//       }) as PluginOption,
      
//       DynamicPublicDirectory (
//       [
//         {
//             input: "../../shared-assets/**",
//             output: "/shared/images",
//             watch: true // default
//         },
//         "public/**",
//         "{\x01,public2}/**"
//       ],
//       {
//         ssr: false
//       }) as PluginOption
//     ]
// })
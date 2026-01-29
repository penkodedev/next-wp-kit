/**
 * Build-time script: Fetches active languages from WordPress WPML
 * Generates src/i18n/locales.generated.json for use in middleware
 * 
 * Usage: npm run prebuild (automatic) or tsx src/utils/build/fetch-locales.ts
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

interface WPMLLanguage {
  code: string;
  name: string;
  is_default?: boolean; // WordPress uses is_default, not default
  default?: boolean;    // Fallback for other implementations
}

interface LocalesConfig {
  supportedLocales: string[];
  defaultLocale: string;
  generatedAt: string;
}

const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://penkode-headless.local/wp-json';
const WPML_ENDPOINT = '/custom/v1/languages';
const OUTPUT_PATH = join(process.cwd(), 'src', 'i18n', 'locales.generated.json');

/**
 * Fetches active languages from WordPress WPML endpoint
 */
async function fetchActiveLanguages(): Promise<WPMLLanguage[]> {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}${WPML_ENDPOINT}`);
    
    if (!response.ok) {
      throw new Error(`WordPress API responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.languages || [];
  } catch (error) {
    console.error('❌ Error fetching languages from WordPress:', error);
    console.error(`   Attempted URL: ${WORDPRESS_API_URL}${WPML_ENDPOINT}`);
    throw error;
  }
}

/**
 * Generates locales configuration from WPML data
 */
function generateLocalesConfig(languages: WPMLLanguage[]): LocalesConfig {
  // All languages returned by the endpoint are active (WordPress only returns active ones)
  if (languages.length === 0) {
    throw new Error('No languages found in WordPress. Check WPML configuration.');
  }

  const defaultLanguage = languages.find(lang => lang.is_default || lang.default);
  
  if (!defaultLanguage) {
    throw new Error('No default language found in WPML configuration.');
  }

  return {
    supportedLocales: languages.map(lang => lang.code),
    defaultLocale: defaultLanguage.code,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Writes locales configuration to JSON file
 */
function writeLocalesFile(config: LocalesConfig): void {
  try {
    const jsonContent = JSON.stringify(config, null, 2);
    writeFileSync(OUTPUT_PATH, jsonContent, 'utf-8');
    
    console.log('✅ Locales generated successfully!');
    console.log(`   Supported: [${config.supportedLocales.join(', ')}]`);
    console.log(`   Default: ${config.defaultLocale}`);
    console.log(`   File: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('❌ Error writing locales file:', error);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔄 Fetching active languages from WordPress...');
  console.log(`   API URL: ${WORDPRESS_API_URL}`);
  
  try {
    const languages = await fetchActiveLanguages();
    const config = generateLocalesConfig(languages);
    writeLocalesFile(config);
  } catch (error) {
     console.error('\n⚠️  Build-time locale detection failed.');
     console.error('   Falling back to manual configuration in middleware.ts');
     console.error('   (Build will continue, but you may need to update locales manually)\n');
     
     // Create a basic fallback configuration if the file doesn\'t exist
     try {
       const fs = require('fs');
       const path = require('path');
       const outputPath = path.join(process.cwd(), 'src', 'i18n', 'locales.generated.json');
       
       if (!fs.existsSync(outputPath)) {
         const fallbackConfig = {
           supportedLocales: ['en'],
           defaultLocale: 'en',
           generatedAt: new Date().toISOString()
         };
         
         fs.writeFileSync(outputPath, JSON.stringify(fallbackConfig, null, 2), 'utf-8');
         console.log('✅ Created fallback locales configuration:');
         console.log(`   Supported: [${fallbackConfig.supportedLocales.join(', ')}]`);
         console.log(`   Default: ${fallbackConfig.defaultLocale}`);
         console.log(`   File: ${outputPath}`);
       }
     } catch (fallbackError) {
       console.error('❌ Failed to create fallback configuration:', fallbackError);
       process.exit(1);
     }
     
     // Don't throw - allow build to continue with hardcoded fallback
     process.exit(0);
   }
 }

// Run if executed directly (not imported)
if (require.main === module) {
  main();
}

export { fetchActiveLanguages, generateLocalesConfig };

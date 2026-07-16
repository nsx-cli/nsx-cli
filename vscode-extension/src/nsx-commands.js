function buildDoctorArgs() {
  return ['doctor'];
}

function buildAnalyzeArgs() {
  return ['analyze'];
}

function buildFixArgs(options = {}) {
  const args = ['fix'];

  if (options.dryRun) {
    args.push('--dry-run');
  }

  if (typeof options.outputPath === 'string' && options.outputPath.length > 0) {
    args.push('--output', options.outputPath);
  }

  return args;
}

function buildGraphArgs() {
  return ['graph'];
}

function buildDocsGenerateArgs() {
  return ['docs', 'generate'];
}

function buildGenerateArgs(type, name) {
  return ['generate', type, name];
}

function buildMakeArgs(target, name) {
  return ['make', target, name];
}

function buildPrismaCrudArgs(modelName) {
  return ['prisma', 'crud', modelName];
}

function buildMarketplaceListArgs() {
  return ['marketplace', 'templates', 'list'];
}

function buildMarketplaceInstallArgs(packId) {
  return ['marketplace', 'templates', 'install', packId];
}

module.exports = {
  buildDoctorArgs,
  buildAnalyzeArgs,
  buildFixArgs,
  buildGraphArgs,
  buildDocsGenerateArgs,
  buildGenerateArgs,
  buildMakeArgs,
  buildPrismaCrudArgs,
  buildMarketplaceListArgs,
  buildMarketplaceInstallArgs,
};

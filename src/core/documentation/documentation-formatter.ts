import path from 'path';
import { DocumentationSnapshot } from './documentation.types';

export class DocumentationFormatter {
  public format(snapshot: DocumentationSnapshot, outputPath: string): string {
    const lines: string[] = [];

    lines.push('# NSX Project Documentation');
    lines.push('');
    lines.push(`Generated at: ${snapshot.generatedAt}`);
    lines.push(`Root: ${path.resolve(snapshot.project.rootDir)}`);
    lines.push(`Output: ${outputPath}`);
    lines.push('');

    lines.push('## Project');
    lines.push('');
    lines.push(`- NestJS: ${snapshot.project.isNestJs ? 'yes' : 'no'}`);
    lines.push(`- Prisma: ${snapshot.project.usesPrisma ? 'yes' : 'no'}`);
    lines.push(`- TypeORM: ${snapshot.project.usesTypeORM ? 'yes' : 'no'}`);
    lines.push('');

    lines.push('## Structure');
    lines.push('');
    lines.push(`- Source files: ${snapshot.structure.sourceFiles}`);
    lines.push(`- Modules: ${snapshot.structure.modules}`);
    lines.push(`- Controllers: ${snapshot.structure.controllers}`);
    lines.push(`- Services: ${snapshot.structure.services}`);
    lines.push(`- Repositories: ${snapshot.structure.repositories}`);
    lines.push(`- Entities: ${snapshot.structure.entities}`);
    lines.push(`- DTOs: ${snapshot.structure.dtos}`);
    lines.push('');

    lines.push('## Routes');
    lines.push('');

    if (snapshot.routes.length === 0) {
      lines.push('- No controller routes found.');
    } else {
      for (const route of snapshot.routes) {
        const normalizedPath = route.filePath.replace(/\\/g, '/');
        lines.push(
          `- ${route.controller} -> /${route.basePath} (${normalizedPath})`,
        );
      }
    }

    lines.push('');
    lines.push('## Prisma');
    lines.push('');

    if (!snapshot.prisma.enabled) {
      lines.push('- Prisma not enabled in this project.');
      return lines.join('\n');
    }

    lines.push(`- Schema: ${snapshot.prisma.schemaPath ?? 'not found'}`);
    lines.push(
      `- Models (${snapshot.prisma.models.length}): ${snapshot.prisma.models.join(', ') || 'none'}`,
    );
    lines.push(
      `- Enums (${snapshot.prisma.enums.length}): ${snapshot.prisma.enums.join(', ') || 'none'}`,
    );

    if (snapshot.prisma.errors.length > 0) {
      lines.push('- Errors:');

      for (const error of snapshot.prisma.errors) {
        lines.push(`  - ${error}`);
      }
    }

    return lines.join('\n');
  }

  public formatConsoleSummary(snapshot: DocumentationSnapshot): string {
    return [
      'Documentation generated',
      `Modules: ${snapshot.structure.modules}`,
      `Controllers: ${snapshot.structure.controllers}`,
      `Services: ${snapshot.structure.services}`,
      `Prisma models: ${snapshot.prisma.models.length}`,
    ].join(' | ');
  }
}

import fs from 'fs';

export interface PrismaRelation {
  fields: string[];
  references: string[];
}

export interface PrismaField {
  name: string;
  type: string;
  isId: boolean;
  isUnique: boolean;
  isOptional: boolean;
  isArray: boolean;
  default?: string;
  relation?: PrismaRelation;
  attributes: string[];
  raw: string;
}

export interface PrismaModel {
  name: string;
  fields: PrismaField[];
  attributes: string[];
  raw: string;
}

export interface PrismaEnum {
  name: string;
  values: string[];
  raw: string;
}

interface PrismaToken {
  kind: 'identifier' | 'symbol' | 'string' | 'newline' | 'eof';
  value: string;
}

interface PrismaNode {
  kind: 'model' | 'enum';
  name?: string;
  fields?: PrismaField[];
  values?: string[];
  attributes?: string[];
  raw?: string;
}

export class PrismaSchemaParser {
  constructor(private readonly schemaPath: string) {}

  parse(): { models: PrismaModel[]; enums: PrismaEnum[]; ast: PrismaNode[] } {
    const source = fs.readFileSync(this.schemaPath, 'utf8');
    const tokens = this.tokenize(source);
    const parser = new PrismaTokenParser(tokens);
    const ast = parser.parse();

    const models = ast
      .filter(
        (node): node is PrismaNode & { kind: 'model' } => node.kind === 'model',
      )
      .map((node) => ({
        name: node.name ?? '',
        fields: node.fields ?? [],
        attributes: node.attributes ?? [],
        raw: node.raw ?? '',
      }));

    const enums = ast
      .filter(
        (node): node is PrismaNode & { kind: 'enum' } => node.kind === 'enum',
      )
      .map((node) => ({
        name: node.name ?? '',
        values: node.values ?? [],
        raw: node.raw ?? '',
      }));

    return { models, enums, ast };
  }

  getModels(): PrismaModel[] {
    return this.parse().models;
  }

  getEnums(): PrismaEnum[] {
    return this.parse().enums;
  }

  findModel(name: string): PrismaModel | undefined {
    return this.getModels().find((model) => model.name === name);
  }

  findEnum(name: string): PrismaEnum | undefined {
    return this.getEnums().find((entry) => entry.name === name);
  }

  private tokenize(source: string): PrismaToken[] {
    const tokens: PrismaToken[] = [];
    let index = 0;

    while (index < source.length) {
      const char = source[index];

      if (char === '\n') {
        tokens.push({ kind: 'newline', value: '\n' });
        index += 1;
        continue;
      }

      if (/\s/.test(char)) {
        index += 1;
        continue;
      }

      if (char === '/' && source[index + 1] === '/') {
        index += 2;
        while (index < source.length && source[index] !== '\n') {
          index += 1;
        }
        continue;
      }

      if ('{}()[].,:;=?'.includes(char)) {
        tokens.push({ kind: 'symbol', value: char });
        index += 1;
        continue;
      }

      if (char === '"') {
        index += 1;
        let value = '';
        while (index < source.length && source[index] !== '"') {
          value += source[index];
          index += 1;
        }
        if (index < source.length) {
          index += 1;
        }
        tokens.push({ kind: 'string', value });
        continue;
      }

      if (/[A-Za-z0-9_@.-]/.test(char)) {
        let value = '';
        while (index < source.length && /[A-Za-z0-9_@.-]/.test(source[index])) {
          value += source[index];
          index += 1;
        }
        tokens.push({ kind: 'identifier', value });
        continue;
      }

      index += 1;
    }

    tokens.push({ kind: 'eof', value: '' });
    return tokens;
  }
}

class PrismaTokenParser {
  constructor(private readonly tokens: PrismaToken[]) {}

  parse(): PrismaNode[] {
    const nodes: PrismaNode[] = [];
    const tokenStream = new PrismaTokenStream(this.tokens);

    while (!tokenStream.isEof()) {
      tokenStream.skipNewlines();
      const token = tokenStream.peek();

      if (token.kind === 'identifier' && token.value === 'model') {
        nodes.push(this.parseModel(tokenStream));
      } else if (token.kind === 'identifier' && token.value === 'enum') {
        nodes.push(this.parseEnum(tokenStream));
      } else {
        tokenStream.advance();
      }
    }

    return nodes;
  }

  private parseModel(tokenStream: PrismaTokenStream): PrismaNode {
    tokenStream.consume('identifier', 'model');
    const name = tokenStream.consume('identifier').value;
    tokenStream.consume('symbol', '{');

    const fields: PrismaField[] = [];
    const attributes: string[] = [];
    let raw = `model ${name}`;

    while (!tokenStream.isEof()) {
      tokenStream.skipNewlines();
      if (
        tokenStream.peek().kind === 'symbol' &&
        tokenStream.peek().value === '}'
      ) {
        tokenStream.consume('symbol', '}');
        break;
      }

      if (
        tokenStream.peek().kind === 'identifier' &&
        tokenStream.peek().value.startsWith('@@')
      ) {
        const attr = tokenStream.consume('identifier').value;
        attributes.push(attr);
        raw += `\n${attr}`;
        continue;
      }

      const line = tokenStream.readUntilNewlineOrBlockEnd();
      if (line.length === 0) {
        continue;
      }

      const field = this.parseFieldLine(line);
      if (field) {
        fields.push(field);
        raw += `\n${field.raw}`;
      }
    }

    return { kind: 'model', name, fields, attributes, raw };
  }

  private parseEnum(tokenStream: PrismaTokenStream): PrismaNode {
    tokenStream.consume('identifier', 'enum');
    const name = tokenStream.consume('identifier').value;
    tokenStream.consume('symbol', '{');

    const values: string[] = [];
    let raw = `enum ${name}`;

    while (!tokenStream.isEof()) {
      tokenStream.skipNewlines();
      if (
        tokenStream.peek().kind === 'symbol' &&
        tokenStream.peek().value === '}'
      ) {
        tokenStream.consume('symbol', '}');
        break;
      }

      const line = tokenStream.readUntilNewlineOrBlockEnd();
      if (line.length === 0) {
        continue;
      }

      const value = this.extractEnumValue(line);
      if (value) {
        values.push(value);
        raw += `\n${value}`;
      }
    }

    return { kind: 'enum', name, values, raw };
  }

  private parseFieldLine(tokens: PrismaToken[]): PrismaField | null {
    const filtered = tokens.filter((token) => token.kind !== 'newline');
    if (filtered.length === 0) {
      return null;
    }

    const first = filtered[0];
    if (first.kind !== 'identifier') {
      return null;
    }

    const fieldName = first.value;
    const typeToken =
      filtered[1]?.kind === 'identifier' ? filtered[1].value : undefined;
    if (!typeToken) {
      return null;
    }

    const type = typeToken;
    let isOptional = false;
    let isArray = false;
    let index = 2;

    if (filtered[index]?.kind === 'symbol' && filtered[index].value === '?') {
      isOptional = true;
      index += 1;
    }

    if (filtered[index]?.kind === 'symbol' && filtered[index].value === '[') {
      isArray = true;
      index += 1;
      if (filtered[index]?.kind === 'symbol' && filtered[index].value === ']') {
        index += 1;
      }
    }

    const field: PrismaField = {
      name: fieldName,
      type: this.normalizeType(type),
      isId: false,
      isUnique: false,
      isOptional,
      isArray,
      attributes: [],
      raw: `${fieldName} ${typeToken}`,
    };

    for (let cursor = index; cursor < filtered.length; cursor += 1) {
      const token = filtered[cursor];
      if (token.kind !== 'identifier') {
        continue;
      }

      if (!token.value.startsWith('@')) {
        continue;
      }

      const attrName = token.value.slice(1);
      field.attributes.push(attrName);
      field.raw += ` ${token.value}`;

      if (attrName === 'id') {
        field.isId = true;
      }
      if (attrName === 'unique') {
        field.isUnique = true;
      }

      if (attrName === 'default') {
        const value = this.readParenthesizedValue(filtered, cursor + 1);
        field.default = value;
        field.raw += `(${value})`;
      }

      if (attrName === 'relation') {
        const value = this.readParenthesizedValue(filtered, cursor + 1);
        field.relation = this.parseRelation(value);
        field.raw += `(${value})`;
      }
    }

    return field;
  }

  private extractEnumValue(tokens: PrismaToken[]): string | null {
    const filtered = tokens.filter((token) => token.kind !== 'newline');
    if (filtered.length === 0) {
      return null;
    }
    const first = filtered[0];
    return first.kind === 'identifier' ? first.value : null;
  }

  private readParenthesizedValue(
    tokens: PrismaToken[],
    startIndex: number,
  ): string {
    let cursor = startIndex;
    while (
      cursor < tokens.length &&
      !(tokens[cursor].kind === 'symbol' && tokens[cursor].value === '(')
    ) {
      cursor += 1;
    }

    if (cursor >= tokens.length) {
      return '';
    }

    cursor += 1;
    const values: string[] = [];
    let depth = 1;
    while (cursor < tokens.length && depth > 0) {
      const token = tokens[cursor];
      if (token.kind === 'symbol' && token.value === '(') {
        depth += 1;
        values.push(token.value);
      } else if (token.kind === 'symbol' && token.value === ')') {
        depth -= 1;
        if (depth > 0) {
          values.push(token.value);
        }
      } else {
        values.push(token.value);
      }
      cursor += 1;
    }

    return values.join('');
  }

  private normalizeType(typeToken: string): string {
    return typeToken.replace(/\?$/, '').replace(/\[\]$/, '').trim();
  }

  private parseRelation(value: string): PrismaRelation | undefined {
    const relation = value.trim();
    if (!relation) {
      return undefined;
    }

    const fields: string[] = [];
    const references: string[] = [];
    const fieldList = this.collectBracketList(relation, 'fields');
    const refList = this.collectBracketList(relation, 'references');

    if (fieldList.length > 0) {
      fields.push(...fieldList);
    }

    if (refList.length > 0) {
      references.push(...refList);
    }

    if (fields.length === 0 && references.length === 0) {
      return undefined;
    }

    return { fields, references };
  }

  private collectBracketList(value: string, key: string): string[] {
    const result: string[] = [];
    let cursor = 0;

    while (cursor < value.length) {
      const keyStart = value.indexOf(key, cursor);
      if (keyStart < 0) {
        break;
      }

      const openBracket = value.indexOf('[', keyStart);
      const closeBracket = value.indexOf(']', openBracket + 1);
      if (openBracket < 0 || closeBracket < 0) {
        break;
      }

      const inside = value.slice(openBracket + 1, closeBracket);
      result.push(
        ...inside
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      );
      cursor = closeBracket + 1;
    }

    return result;
  }
}

class PrismaTokenStream {
  private index = 0;

  constructor(private readonly tokens: PrismaToken[]) {}

  peek(): PrismaToken {
    return this.tokens[this.index] ?? { kind: 'eof', value: '' };
  }

  isEof(): boolean {
    return this.peek().kind === 'eof';
  }

  consume(kind: PrismaToken['kind'], value?: string): PrismaToken {
    const token = this.peek();
    if (token.kind !== kind || (value !== undefined && token.value !== value)) {
      throw new Error(`Esperado ${value ?? kind}, encontrado ${token.value}`);
    }
    this.index += 1;
    return token;
  }

  advance(): PrismaToken {
    const token = this.peek();
    this.index += 1;
    return token;
  }

  skipNewlines(): void {
    while (this.peek().kind === 'newline') {
      this.advance();
    }
  }

  readUntilNewlineOrBlockEnd(): PrismaToken[] {
    const lineTokens: PrismaToken[] = [];
    while (!this.isEof()) {
      const token = this.peek();
      if (
        token.kind === 'newline' ||
        (token.kind === 'symbol' && token.value === '}')
      ) {
        break;
      }
      lineTokens.push(this.advance());
    }
    return lineTokens;
  }
}

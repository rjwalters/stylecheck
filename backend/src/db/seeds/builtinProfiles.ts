import Database from 'better-sqlite3';

interface ProfileData {
  name: string;
  description: string;
  author: string;
  languages: string[];
  preferences: Record<string, unknown>;
  custom_rules: string[];
}

export const builtinProfiles: ProfileData[] = [
  // 1. Minimal Profile
  {
    name: 'Minimal',
    description: 'Lean preferences focusing only on critical style issues',
    author: 'StyleCheck Team',
    languages: ['python', 'javascript', 'typescript'],
    preferences: {
      naming: {
        variables: 'flexible',
        functions: 'flexible',
        classes: 'descriptive',
      },
      organization: {
        max_function_length: 200,
        imports_grouped: false,
      },
      documentation: {
        comment_style: 'minimal',
        docstring_format: 'optional',
      },
      typing: {
        coverage: 'none',
        return_annotations: 'none',
      },
      structure: {
        line_length: 120,
        blank_lines: 'liberal',
      },
      error_handling: {
        validation: 'optimistic',
        logging: 'minimal',
      },
      practices: {
        prefer_f_strings: false,
        allow_walrus: true,
      },
    },
    custom_rules: ['Avoid duplicate code', 'Keep it simple'],
  },

  // 2. PEP 8 Profile
  {
    name: 'PEP 8',
    description: 'Standard Python style guide (PEP 8) compliance',
    author: 'StyleCheck Team',
    languages: ['python'],
    preferences: {
      naming: {
        variables: 'snake_case',
        functions: 'snake_case',
        classes: 'PascalCase',
        constants: 'UPPER_CASE',
      },
      organization: {
        max_function_length: 50,
        imports_grouped: true,
        import_order: 'stdlib, third-party, local',
      },
      documentation: {
        comment_style: 'moderate',
        docstring_format: 'google',
      },
      typing: {
        coverage: 'recommended',
        return_annotations: 'public_functions',
      },
      structure: {
        line_length: 79,
        blank_lines: 'conservative',
        indent_size: 4,
      },
      error_handling: {
        validation: 'balanced',
        logging: 'moderate',
      },
      practices: {
        prefer_f_strings: true,
        allow_walrus: false,
      },
    },
    custom_rules: [
      'Follow PEP 8 naming conventions',
      'Maximum line length 79 characters',
      'Use 4 spaces for indentation',
      'Two blank lines between top-level definitions',
    ],
  },

  // 3. Google Style Profile
  {
    name: 'Google Style',
    description: "Google's Python style guide conventions",
    author: 'StyleCheck Team',
    languages: ['python'],
    preferences: {
      naming: {
        variables: 'snake_case',
        functions: 'snake_case',
        classes: 'CapWords',
        constants: 'CAPS_WITH_UNDERSCORES',
      },
      organization: {
        max_function_length: 60,
        imports_grouped: true,
        import_order: 'stdlib, third-party, local',
      },
      documentation: {
        comment_style: 'detailed',
        docstring_format: 'google',
        require_docstrings: true,
      },
      typing: {
        coverage: 'comprehensive',
        return_annotations: 'always',
        modern_syntax: true,
      },
      structure: {
        line_length: 80,
        blank_lines: 'conservative',
        indent_size: 4,
      },
      error_handling: {
        validation: 'defensive',
        logging: 'extensive',
        explicit_exceptions: true,
      },
      practices: {
        prefer_f_strings: true,
        allow_walrus: true,
        use_type_hints: true,
      },
    },
    custom_rules: [
      'All public functions must have docstrings',
      'Use Google-style docstring format',
      'Prefer explicit over implicit',
      'Use type hints for all function signatures',
    ],
  },

  // 4. Type-Safe Profile
  {
    name: 'Type-Safe',
    description: 'Heavy emphasis on type annotations and type safety',
    author: 'StyleCheck Team',
    languages: ['python', 'typescript'],
    preferences: {
      naming: {
        variables: 'snake_case',
        functions: 'verb_first',
        classes: 'PascalCase',
      },
      organization: {
        max_function_length: 50,
        imports_grouped: true,
        separate_type_imports: true,
      },
      documentation: {
        comment_style: 'moderate',
        docstring_format: 'detailed',
      },
      typing: {
        coverage: 'comprehensive',
        return_annotations: 'always',
        parameter_annotations: 'always',
        modern_syntax: true,
        strict_optional: true,
      },
      structure: {
        line_length: 100,
        blank_lines: 'conservative',
      },
      error_handling: {
        validation: 'defensive',
        logging: 'extensive',
        typed_exceptions: true,
      },
      practices: {
        prefer_f_strings: true,
        allow_walrus: true,
        immutability_preferred: true,
      },
    },
    custom_rules: [
      'All function parameters must have type hints',
      'All return types must be annotated',
      'Use mypy strict mode',
      'Avoid Any type except when absolutely necessary',
      'Prefer TypedDict over dict for structured data',
    ],
  },

  // 5. Pragmatic Profile
  {
    name: 'Pragmatic',
    description: 'Balanced, readability-focused pragmatic style',
    author: 'StyleCheck Team',
    languages: ['python', 'javascript', 'typescript'],
    preferences: {
      naming: {
        variables: 'descriptive',
        functions: 'verb_first',
        classes: 'descriptive',
      },
      organization: {
        max_function_length: 75,
        imports_grouped: true,
        logical_grouping: true,
      },
      documentation: {
        comment_style: 'explain_why',
        docstring_format: 'concise',
      },
      typing: {
        coverage: 'balanced',
        return_annotations: 'complex_functions',
      },
      structure: {
        line_length: 100,
        blank_lines: 'readable',
        visual_alignment: true,
      },
      error_handling: {
        validation: 'balanced',
        logging: 'actionable',
        fail_fast: true,
      },
      practices: {
        prefer_f_strings: true,
        allow_walrus: true,
        readability_over_cleverness: true,
      },
    },
    custom_rules: [
      'Code should be self-documenting',
      'Comments explain why, not what',
      'Optimize for readability',
      'Avoid premature optimization',
      'Prefer simple over clever',
    ],
  },

  // 6. Strict Profile
  {
    name: 'Strict',
    description: 'Very opinionated style that catches everything',
    author: 'StyleCheck Team',
    languages: ['python', 'javascript', 'typescript'],
    preferences: {
      naming: {
        variables: 'snake_case',
        functions: 'verb_first',
        classes: 'PascalCase',
        constants: 'UPPER_CASE',
        private_prefix: '_',
      },
      organization: {
        max_function_length: 30,
        max_class_length: 200,
        imports_grouped: true,
        import_order: 'alphabetical',
        one_import_per_line: true,
      },
      documentation: {
        comment_style: 'comprehensive',
        docstring_format: 'detailed',
        require_docstrings: true,
        require_type_hints_in_docstrings: true,
      },
      typing: {
        coverage: 'complete',
        return_annotations: 'always',
        parameter_annotations: 'always',
        variable_annotations: 'complex_types',
        modern_syntax: true,
        strict_optional: true,
      },
      structure: {
        line_length: 88,
        blank_lines: 'strict',
        indent_size: 4,
        trailing_commas: 'always',
      },
      error_handling: {
        validation: 'paranoid',
        logging: 'extensive',
        explicit_exceptions: true,
        no_bare_except: true,
      },
      practices: {
        prefer_f_strings: true,
        allow_walrus: false,
        immutability_preferred: true,
        no_mutable_defaults: true,
        explicit_is_better: true,
      },
    },
    custom_rules: [
      'Every function must have a docstring',
      'Every public API must have type annotations',
      'No functions longer than 30 lines',
      'No classes longer than 200 lines',
      'All imports must be absolute',
      'No wildcard imports',
      'No mutable default arguments',
      'Always use context managers for resources',
      'Prefer composition over inheritance',
      'Single responsibility principle strictly enforced',
    ],
  },
];

export function seedBuiltinProfiles(db: Database.Database): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO profiles (
      name, description, author, languages, preferences, custom_rules, is_builtin
    ) VALUES (?, ?, ?, ?, ?, ?, true)
  `);

  const insertMany = db.transaction((profiles: ProfileData[]) => {
    for (const profile of profiles) {
      insert.run(
        profile.name,
        profile.description,
        profile.author,
        JSON.stringify(profile.languages),
        JSON.stringify(profile.preferences),
        JSON.stringify(profile.custom_rules)
      );
    }
  });

  insertMany(builtinProfiles);
  console.log(`Seeded ${builtinProfiles.length} built-in profiles`);
}

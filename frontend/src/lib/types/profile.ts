// Profile type definitions for VibeCov

export interface Profile {
  id: number;
  name: string;
  description?: string;
  author?: string;
  languages: string[];
  preferences: ProfilePreferences;
  custom_rules: string[];
  reference_guide_path?: string;
  is_builtin: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfilePreferences {
  naming: NamingPreferences;
  organization: OrganizationPreferences;
  documentation: DocumentationPreferences;
  typing: TypingPreferences;
  structure: StructurePreferences;
  error_handling: ErrorHandlingPreferences;
  practices: PracticesPreferences;
}

export interface NamingPreferences {
  variables: 'snake_case' | 'camelCase' | 'PascalCase' | 'flexible';
  functions: 'verb_first' | 'noun_first' | 'flexible';
  classes: 'descriptive' | 'concise' | 'flexible';
  constants: 'UPPER_CASE' | 'lower_case' | 'flexible';
  private_prefix: '_' | 'm_' | 'private' | 'none';
}

export interface OrganizationPreferences {
  import_style: 'grouped' | 'alphabetical' | 'flexible';
  function_length: 'short' | 'medium' | 'flexible';
  class_structure: 'fields_first' | 'methods_first' | 'flexible';
  file_organization: 'one_class' | 'multiple_classes' | 'flexible';
}

export interface DocumentationPreferences {
  comment_verbosity: 'minimal' | 'moderate' | 'extensive';
  docstring_style: 'concise' | 'detailed';
  inline_comments: 'avoid' | 'encourage' | 'flexible';
  todo_format: 'TODO:' | '# TODO' | '@todo' | 'flexible';
}

export interface TypingPreferences {
  type_coverage: 'minimal' | 'moderate' | 'comprehensive';
  return_annotations: 'always' | 'selective' | 'none';
  variable_annotations: 'always' | 'when_needed' | 'avoid';
  modern_syntax: 'prefer' | 'allow' | 'avoid';
}

export interface StructurePreferences {
  line_length: 80 | 100 | 120;
  blank_lines: 'conservative' | 'liberal';
  bracket_style: 'K&R' | 'Allman' | 'one_line';
  import_organization: 'multiple' | 'one_per_line';
}

export interface ErrorHandlingPreferences {
  exception_handling: 'explicit' | 'implicit';
  error_messages: 'verbose' | 'concise';
  validation: 'defensive' | 'optimistic';
  logging: 'extensive' | 'minimal';
}

export interface PracticesPreferences {
  type_hints: 'enforce' | 'suggest' | 'ignore';
  f_strings: 'prefer' | 'allow_all';
  walrus_operator: 'encourage' | 'avoid';
  match_statements: 'prefer' | 'traditional';
}

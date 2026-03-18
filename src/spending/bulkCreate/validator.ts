import {
  BulkCreateSpendingParams,
  CreateSpendingParams,
} from "../interface.ts";

// Result
interface ValidationError {
  index: number;
  field: string;
  message: string;
}

class ValidationResult {
  errors: ValidationError[];

  constructor(errors: ValidationError[] = []) {
    this.errors = errors;
  }

  isValid(): boolean {
    return this.errors.length === 0;
  }

  merge(other: ValidationResult): ValidationResult {
    return new ValidationResult([...this.errors, ...other.errors]);
  }

  static ok(): ValidationResult {
    return new ValidationResult([]);
  }

  static fail(index: number, field: string, message: string): ValidationResult {
    return new ValidationResult([{ index, field, message }]);
  }
}

// Item Validator Definition
interface ItemValidator {
  field: string;
  validate(index: number, item: CreateSpendingParams): ValidationResult;
}

class CategoryValidator implements ItemValidator {
  private readonly categoryIds: string[];
  field: string = "categoryId";

  constructor(categoryIds: string[]) {
    this.categoryIds = categoryIds;
  }

  validate(index: number, item: CreateSpendingParams): ValidationResult {
    return this.categoryIds.includes(item.categoryId)
      ? ValidationResult.ok()
      : ValidationResult.fail(
        index,
        this.field,
        `${item.categoryId} not registered`,
      );
  }
}

class SourceValidator implements ItemValidator {
  private readonly sourceIds: string[];
  field: string = "sourceId";

  constructor(sourceIds: string[]) {
    this.sourceIds = sourceIds;
  }

  validate(index: number, item: CreateSpendingParams): ValidationResult {
    return this.sourceIds.includes(item.sourceId)
      ? ValidationResult.ok()
      : ValidationResult.fail(
        index,
        this.field,
        `${item.sourceId} not registered`,
      );
  }
}

export class BulkCreateSpendingValidator {
  private readonly validators: ItemValidator[];

  constructor(categoryIds: string[], sourceIds: string[]) {
    this.validators = [
      new CategoryValidator(categoryIds),
      new SourceValidator(sourceIds),
    ];
  }

  validate(spendings: BulkCreateSpendingParams): ValidationResult {
    return spendings.reduce((result, item, index) => {
      return result.merge(
        this.validateItem(index, item),
      );
    }, ValidationResult.ok());
  }

  private validateItem(
    index: number,
    item: CreateSpendingParams,
  ): ValidationResult {
    return this.validators.reduce((result, validator) => {
      return result.merge(validator.validate(index, item));
    }, ValidationResult.ok());
  }
}

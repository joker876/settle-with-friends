import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';

export function Nested(typeFn: () => Function): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Type(typeFn)(target, propertyKey as string);
    ValidateNested()(target, propertyKey as string);
  };
}

export function NestedArray(typeFn: () => Function): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    IsNotEmpty({ each: true })(target, propertyKey as string);
    Type(typeFn)(target, propertyKey as string);
    ValidateNested({ each: true })(target, propertyKey as string);
  };
}

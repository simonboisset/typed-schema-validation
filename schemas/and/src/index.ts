import type { Schema } from '@ts-v/core';

type SchemaValue<S> = S extends Schema<infer A> ? A : never;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

const and =
  <S extends Schema<any>>(schemas: S[]): Schema<UnionToIntersection<SchemaValue<S>>> =>
  //@ts-ignore
  (value: unknown) => {
    const [schema, ...other] = schemas;
    const { data, error } = schema(value);
    if (other.length > 0) {
      const nextValidation = and(other)(typeof data === 'object' ? value : data);
      return {
        error:
          typeof nextValidation.error === 'object' && typeof error === 'object' //@ts-ignore
            ? { ...error, ...nextValidation.error }
            : nextValidation.error || error,
        data:
          typeof nextValidation.data === 'object' && typeof data === 'object' //@ts-ignore
            ? { ...data, ...nextValidation.data }
            : nextValidation.data,
      };
    }
    return { data, error };
  };

export default and;
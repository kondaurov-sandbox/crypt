import Ajv, { ErrorObject, Schema } from "ajv"

const ajv = new Ajv()

interface ISchema {
    validate(raw: any): ErrorObject[] | null
}

export function compileSchema(input: Schema): ISchema {
    const _validate = ajv.compile(input)
    return {
        validate(raw: any) {
            const valid = _validate(raw)
            if (!valid) return _validate.errors!
            return null
        }
    }
}

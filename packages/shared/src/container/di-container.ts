import {
    createContainer as awilixCreateContainer,
    type AwilixContainer,
    type FunctionReturning,
    InjectionMode,
    asClass,
    asFunction,
    Constructor,
    Lifetime,
    asValue,
} from "awilix";

export const createContainer = (): AwilixContainer =>
    awilixCreateContainer({
        injectionMode: InjectionMode.CLASSIC,
    });

export const registerService = <T>(service: Constructor<T>) => asClass(service, { lifetime: Lifetime.SINGLETON });

export const registerFunction = <T>(fn: FunctionReturning<T>) => asFunction(fn);

export const registerValue = <T>(value: T) => asValue(value);

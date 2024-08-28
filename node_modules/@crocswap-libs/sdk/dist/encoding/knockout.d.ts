import { BigNumberish } from "ethers";
export declare class KnockoutEncoder {
    constructor(base: string, quote: string, poolIdx: number);
    private base;
    private quote;
    private poolIdx;
    private abiCoder;
    encodeKnockoutMint(qty: bigint, lowerTick: number, upperTick: number, isBid: boolean, useSurplusFlags: number): string;
    encodeKnockoutBurnQty(qty: bigint, lowerTick: number, upperTick: number, isBid: boolean, useSurplusFlags: number): string;
    encodeKnockoutBurnLiq(liq: bigint, lowerTick: number, upperTick: number, isBid: boolean, useSurplusFlags: number): string;
    encodeKnockoutRecover(pivotTime: number, lowerTick: number, upperTick: number, isBid: boolean, useSurplusFlags: number): string;
    private encodeCommonArgs;
}
export interface KnockoutCrossState {
    pivotTime: number;
    mileage: BigNumberish;
    commitEntropy: bigint;
}
export declare function packKnockoutLinks(crosses: KnockoutCrossState[]): bigint[];

/*
    Numerical format for storing in database:
     0: Empty result (cutoff-ed)
    -1: DNF
    -2: DNS
*/

const calculateAo5 = (result: number[], cutoff: boolean) =>
{
    let dnfCount: number = 0;
    let sumTime: number = 0;

    const positiveTimes: number[] = result.filter((time) => time > 0);

    result.forEach((time) => {
        if (time < 0)
            dnfCount++;
        else
            sumTime += time;
    });

    const best = Math.min(...positiveTimes);
    const worst = Math.max(...positiveTimes);

    // Case: didn't pass the cutoff
    if (cutoff && positiveTimes.length <= 2)
        return {best: (best === 0 ? -1 : best), result: 0};

    // Case: All DNF
    if (dnfCount === 5)
        return {best: -1, result: -1}

    // Case: 2++ DNFs
    if (dnfCount >= 2)
        return {best, result: -1};

    // Case: Normal
    if (dnfCount === 0)
        sumTime -= worst;

    sumTime -= best;

    return {best, result: sumTime/(3)};
}

const calculateBo3 = (result: number[]) =>
{
    const positiveTimes = result.filter((time) => time > 0);

    if (positiveTimes.length === 0)
        return -1;

    return Math.min(...positiveTimes);
}

export { calculateAo5, calculateBo3 };
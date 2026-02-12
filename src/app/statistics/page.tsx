import { getAllNRs } from '../actions/national-records';
import { getUserRole } from '../actions/users';
import { useSession } from 'next-auth/react';
import StatisticsPage from '../components/StatisticsPage';

const Page = async () =>
{
    const rawNRs = await getAllNRs();

    const allNRs = JSON.parse(JSON.stringify(rawNRs));

    return (
        <>
            <StatisticsPage NR={allNRs}/>
        </>
    );
}

export default Page;
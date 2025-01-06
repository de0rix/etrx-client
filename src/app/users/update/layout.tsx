import UserViewPage from '../view/page'


export default function Layout({children}: {children: React.ReactNode})
{
    return(
        <>
            {children}
            <UserViewPage></UserViewPage>
        </>
    )
}
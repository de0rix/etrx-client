'use client'

import DdStyles from "./dropdown.module.css"
import MiscStyles from "./misc.module.css"
import { useRouter } from "next/navigation"
import Dropdown from "./dropdown";

export default function Header()
{
    const router = useRouter();

    return(
        <>
            <div className="flex items-center fixed w-full h-16 bg-main">
                <h1 className={DdStyles.header_elem_static + ' select-none bg-main-light font-bold italic text-[28px]'}>
                    ETRX
                </h1>
                <button onClick={() => router.push('/')} className={DdStyles.header_elem}>
                    Главная
                </button>
                <Dropdown header="Контесты">
                    <button onClick={() => router.push('/contests/view')} className={DdStyles.dropdown_elem}>Просмотреть все</button>
                    <button onClick={() => {router.push('/contests/update')}} className={DdStyles.dropdown_elem}>
                        <div className={MiscStyles.add_ico}></div> Обновить
                    </button>
                </Dropdown>
                <Dropdown header="Ученики">
                    <button onClick={() => router.push('/users/view')} className={DdStyles.dropdown_elem}>Просмотреть всех</button>
                    <button onClick={() => {router.push('/users/update')}} className={DdStyles.dropdown_elem}>
                        <div className={MiscStyles.add_ico}></div> Обновить
                    </button>
                </Dropdown>
                <button onClick={() => router.push('/problems/view')} className={DdStyles.header_elem}>Задачи</button>
                <button onClick={() => router.push('/about')} className={DdStyles.header_elem}>О сайте</button>
            </div>
            {/* acts as bottom margin */}
            <div className="w-full h-20"></div>
        </>
    )
}
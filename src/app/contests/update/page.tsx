'use client';
import GizmoSpinner from "@/app/components/gizmo-spinner";
import { updateContests } from "@/app/services/contests";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page()
{
    const router = useRouter();
    const [updateStatus, setUpdateStatus] = useState(0);
    // Make a POST request to update contests once a page loads
    useEffect(() => {
        updateContests().then((response) => {
            setUpdateStatus(response.status);
            setTimeout(() => router.push('/contests/view'), 5000);
        });
    }, []);

    return(
        <>
            {updateStatus == 0 && 
                <div className="mb-40">
                    <GizmoSpinner title="Обновление данных..." timeout={30000}></GizmoSpinner>
                </div>
            }
            {updateStatus == 200 && <h1 className="w-full text-center text-3xl mb-4">Обновление выполнено успешно</h1>}
            {updateStatus != 200 && updateStatus != 0 && 
                <h1 className="w-full text-center text-3xl mb-4">Ошибка: запрос обновления вернул статус код {updateStatus}</h1>
            }
        </>
    )
}
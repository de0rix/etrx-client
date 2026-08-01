import React from 'react';
import Styles from "./network-table.module.css";
import { ChangeDetail, UpdateData } from '@/app/models/Updates';

export function ChangeList({ items } : { items: ChangeDetail[] }) {
    return (
        <div className="ml-8">
            <ul className="list-disc">
                {items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                        {item.type}
                        <div className="ml-6">
                            <ul className="list-circle">
                                {item.details.map((detail, detailIndex) => (
                                    <li key={detailIndex}>{detail}</li>
                                ))}
                            </ul>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function UpdateRow({ update } : { update: UpdateData }) {
    return (
        <tr>
            <td className={Styles.cell}>
                <div className="text-center">{update.date}</div>
            </td>
            <td className={Styles.cell}>
                <div className="text-center">{update.author}</div>
            </td>
            <td className={Styles.cell}>
                <ChangeList items={update.items} />
            </td>
        </tr>
    );
}
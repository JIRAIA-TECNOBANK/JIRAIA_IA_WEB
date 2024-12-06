export class Menu {
    id: string;
    label: string;
    icon?: string;
    link?: string;
    active?: boolean;
    parentId?: string;
    child?: Menu[];
}
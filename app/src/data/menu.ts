type MenuItemType = 'primary' | 'secondary' | 'normal';
interface MenuItem {
    name: string;
    url: string;
    type: MenuItemType;
    target: string | null
}
export const menuItems: MenuItem[] = [
    { name: 'Contests', url: '/', type: 'normal', target: null },
    { name: 'Stream', url: 'https://www.twitch.tv/murdercrumpet', type: 'normal', target: '_blank' },
    { name: 'Login', url: '/account', type: 'normal', target: '' },
];
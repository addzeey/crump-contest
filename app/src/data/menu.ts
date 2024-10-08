type MenuItemType = 'primary' | 'secondary' | 'normal';
interface MenuItem {
    name: string;
    url: string;
    type: MenuItemType;
    target: string | null
}
export const menuItems: MenuItem[] = [
    { name: 'Contests', url: '/', type: 'normal', target: null },
    { name: 'how to submit', url: 'submit', type: 'normal', target: null},
    { name: 'Twitch', url: 'https://www.twitch.tv/murdercrumpet', type: 'normal', target: '_blank' },
    { name: 'Login', url: '/login', type: 'normal', target: '' },
];
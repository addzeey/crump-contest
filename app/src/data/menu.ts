type MenuItemType = 'primary' | 'secondary' | 'normal';
interface MenuItem {
    name: string;
    url: string;
    type: MenuItemType;
    target: string | null
    icon: string | null
}
export const menuItems: MenuItem[] = [
    { name: 'Contests', url: '/', type: 'normal', target: null, icon: "" },
    { name: 'Twitch Stream', url: 'https://www.twitch.tv/murdercrumpet', type: 'normal', target: '_blank', icon: "faTwitch" },
    { name: 'Login', url: '/account', type: 'normal', target: '', icon: "" },
];
/**
 * Sets the confirmation state of the user when the confirm they are 18+
 *  * @param confirmation
 */
export const setAgeConfirmation = (confirmation: boolean) => {
    localStorage.setItem('ageConfirmation', confirmation ? 'true' : 'false');
} 
/**
 * Returns the confirmation state of the user when the confirm they are 18+
 */
export const getAgeConfirmation = () => {
    return localStorage.getItem('ageConfirmation') === 'true';
}
/**
 * Sets the state of the user to always show NSFW content
 * @param confirmation
*/
export const setAlwaysShowNsfw = (confirmation: boolean) => {
    localStorage.setItem('showNsfw', confirmation ? 'true' : 'false');
}
export const getAlwaysShowNsfw = (): boolean => {
    // if set return true
    return localStorage.getItem('showNsfw') === 'true';
}


export const parseUrls = (text: string) => {
    return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
}
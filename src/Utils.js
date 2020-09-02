

export const hasUnplayedStrategies = (player) => {
    for (let i = 0; i < player.strategies.length; i++) {
        if (!player.strategies[i].isUsed) {
            return true;
        }
    }
    return false;
 };
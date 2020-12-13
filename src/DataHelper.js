import properties from './data/properties.json';

import agenda_file from './data/agendas.json';
import colour_file from './data/colours.json';
import factions_file from './data/factions.json';
import objectives_file from './data/objectives.json';
import planets_file from './data/planets.json';
import systems_file from './data/systems.json';
import technologies_file from './data/technologies.json';
import strategy_cards_file from './data/strategy-cards.json';

export const agenda_store = () => {
    return filterData(agenda_file);
}

export const colour_store = () => {
    return filterData(colour_file);
}

export const faction_store = () => {
    return filterData(factions_file);
}

export const objective_store = () => {
    return filterData(objectives_file);
}

export const planet_store = () => {
    return filterData(planets_file);
}

export const system_store = () => {
    return filterData(systems_file);
}

export const tech_store = () => {
    return technologies_file;
}

export const strategy_card_store = () => {
    return strategy_cards_file;
}


function filterData(file) {
    return file.filter((item) => 
        (!item.setAdded || properties.expansions.includes(item.setAdded)) && (!item.setRemoved || !properties.expansions.includes(item.setRemoved)));
}


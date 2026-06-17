// Tradução dos sub-nomes das ações internas das habilidades dos adversários
const dhActionNames = {
    'Acid Ground': 'Solo Ácido',
    'Agility Roll': 'Rolagem de Agilidade',
    'Apply Venom': 'Aplicar Veneno',
    'Attack': 'Ataque',
    'Become Dazed': 'Ficar Atordoado',
    'Bees!': 'Abelhas!',
    'Block': 'Bloquear',
    'Circle': 'Círculo',
    'Clear HP': 'Limpar PV',
    'Clear Stress': 'Limpar Fadiga',
    'Collision Damage': 'Dano de Colisão',
    'Countdown': 'Contagem Regressiva',
    'Curse': 'Maldição',
    'Damage': 'Dano',
    'Damage Armor': 'Danificar Armadura',
    'Damage Hope': 'Dano à Esperança',
    'Damage Stress': 'Dano de Fadiga',
    'Deathlocked attack': 'Ataque sob Selo da Morte',
    'Drop Bomb': 'Soltar Bomba',
    'Gain Fear': 'Ganhar Medo',
    'Generic': 'Genérico',
    'Give Token': 'Dar Marcador',
    'Glow': 'Brilhar',
    'Halve Evasion': 'Reduzir Evasão pela Metade',
    'Heal': 'Curar',
    'Heal HP': 'Curar PV',
    'Healing': 'Cura',
    'Hidden attack': 'Ataque Escondido',
    'Hope Damage': 'Dano à Esperança',
    'Ignited Damage': 'Dano de Chamas',
    'Lose Hope': 'Perder Esperança',
    'Make Guilty': 'Tornar Culpado',
    'Mark': 'Marcar',
    'Mark HP': 'Marcar PV',
    'Mark Stress': 'Marcar Fadiga',
    'Protect': 'Proteger',
    'Pull Tree': 'Derrubar Árvore',
    'Rally': 'Reunir',
    'Roll 2d10': 'Rolar 2d10',
    'Roll 2d4': 'Rolar 2d4',
    'Roll d10': 'Rolar d10',
    'Roll d20': 'Rolar d20',
    'Roll d6': 'Rolar d6',
    'Roll d8': 'Rolar d8',
    'Roll Save': 'Rolar Resistência',
    'Spend Fear': 'Gastar Medo',
    'Spend Stress': 'Gastar Fadiga',
    'Spit Attack': 'Ataque de Cuspe',
    'Splash': 'Respingo',
    'Spotlight Allies': 'Dar Holofote a Aliados',
    'Spotlight Demons': 'Dar Holofote a Demônios',
    'Spotlight: Relentless': 'Holofote: Implacável',
    'Start Countdown': 'Iniciar Contagem Regressiva',
    'Stress Damage': 'Dano de Fadiga',
    'Summon': 'Invocar',
    'Summon Guards': 'Invocar Guardas',
    'Throw': 'Arremessar',
    'Transform': 'Transformar',
    'Use': 'Usar',
};

// Dicionario de nomes de Active Effects (Ingles -> PT-BR), carregado de arquivo.
// Usado pelo conversor dhEffects para traduzir os effects embutidos nos itens.
let dhEffectNames = {};
fetch('modules/daggerheart-traducao-livro-the-void-pt-BR/effect-translations.json')
    .then((r) => (r.ok ? r.json() : {}))
    .then((j) => { dhEffectNames = j || {}; })
    .catch((e) => console.warn('daggerheart-traducao | Falha ao carregar effect-translations.json', e));

Hooks.once('init', () => {
    // Registro do Babele
    if (typeof Babele !== 'undefined') {
        const babele = Babele.get();

        babele.register({
            module: 'daggerheart-traducao-livro-the-void-pt-BR',
            lang: 'pt-BR',
            dir: 'compendium',
        });

        // Conversor para traduzir as habilidades (itens embutidos) dos adversários
        babele.registerConverters({
            dhAdversaryItems: (items, translations) => {
                if (!Array.isArray(items)) return items;
                return items.map((item) => {
                    const updated = foundry.utils.deepClone(item);
                    const t = translations && translations[item.name];
                    if (t) {
                        if (t.name) updated.name = t.name;
                        if (typeof t.description === 'string') {
                            updated.system = updated.system || {};
                            updated.system.description = t.description;
                        }
                    }
                    const actions = updated.system && updated.system.actions;
                    if (actions) {
                        for (const id in actions) {
                            const act = actions[id];
                            if (act && act.name && dhActionNames[act.name]) {
                                act.name = dhActionNames[act.name];
                            }
                        }
                    }
                    return updated;
                });
            },

            // Traduz os nomes dos Active Effects embutidos (array document.effects)
            dhEffects: (effects) => {
                if (!Array.isArray(effects)) return effects;
                return effects.map((eff) => {
                    if (!eff || !eff.name) return eff;
                    const t = dhEffectNames[eff.name];
                    if (!t) return eff;
                    const updated = foundry.utils.deepClone(eff);
                    updated.name = t;
                    return updated;
                });
            },
        });
    }
});

Hooks.on('ready', async () => {
    try {
        const homebrew = foundry.utils.deepClone(
            game.settings.get('daggerheart', 'Homebrew')
        );

        // Apenas labels visíveis
        homebrew.currency.coins.label = 'Moedas';
        homebrew.currency.handfuls.label = 'Punhados';
        homebrew.currency.bags.label = 'Bolsas';
        homebrew.currency.chests.label = 'Baús';

        await game.settings.set(
            'daggerheart',
            'Homebrew',
            homebrew
        );

        console.log(
            'daggerheart-traducao-livro-the-void-pt-BR | Labels das moedas aplicadas!'
        );

    } catch (err) {
        console.error(
            'daggerheart-traducao-livro-the-void-pt-BR | Erro:',
            err
        );
    }
});
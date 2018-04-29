const _ = require('lodash');
const winston = require('winston');

const Pillar = () => {
  function* LoopedGenerator(values) {
    let index = 0;

    while (true) {
      yield values[index];
      index += 1;

      if (index >= values.length) {
        index = 0;
      }
    }
  }

  function* Cycle() {
    const stems = LoopedGenerator([
      { chinese: '甲', english: 'jia' },
      { chinese: '乙', english: 'yi' },
      { chinese: '丙', english: 'bing' },
      { chinese: '丁', english: 'ding' },
      { chinese: '戊', english: 'wu' },
      { chinese: '己', english: 'ji' },
      { chinese: '庚', english: 'geng' },
      { chinese: '辛', english: 'xin' },
      { chinese: '壬', english: 'ren' },
      { chinese: '癸', english: 'gui' },
    ]);

    const branches = LoopedGenerator([
      { chinese: '子', english: 'zi', elements: ['water'] },
      { chinese: '丑', english: 'chou', elements: ['earth', 'water', 'metal'] },
      { chinese: '寅', english: 'yin', elements: ['wood', 'fire', 'earth'] },
      { chinese: '卯', english: 'mao', elements: ['wood'] },
      { chinese: '辰', english: 'chen', elements: ['earth', 'wood', 'water'] },
      { chinese: '巳', english: 'si', elements: ['fire', 'earth', 'metal'] },
      { chinese: '午', english: 'wu', elements: ['fire', 'earth'] },
      { chinese: '未', english: 'wei', elements: ['earth', 'fire', 'wood'] },
      { chinese: '申', english: 'shen', elements: ['metal', 'water', 'earth'] },
      { chinese: '酉', english: 'you', elements: ['metal'] },
      { chinese: '戌', english: 'xu', elements: ['earth', 'metal', 'fire'] },
      { chinese: '亥', english: 'hai', elements: ['water', 'wood'] },
    ]);

    while (true) {
      yield {
        stem: stems.next().value,
        branch: branches.next().value,
      };
    }
  }

  const LIMIT = 60;
  const cycle = Cycle();
  const cycleValues = _.times(LIMIT, () => cycle.next().value);

  function valueAt(index) {
    return cycleValues[index % LIMIT];
  }

  function find({ stem, branch }) {
    const search = _.find(
      cycleValues,
      { stem, branch },
    );

    return search;
  }

  function indexOf({ stem, branch }) {
    return _.findIndex(cycleValues, find({ stem, branch }));
  }

  return { valueAt, indexOf, find };
};

const FourPillars = (pillars, config) => {
  // init tasks - validate all input, transform to full pillars
  const processedPillars = _.map(pillars, (pillar) => {
    const ref = Pillar();
    const obj = ref.find({
      stem: pillar.stem,
      branch: pillar.branch,
    });

    // add unused flag to each pillar for calculations later
    return { ...obj, used: false };
  });

  if (!_.every(processedPillars)) {
    throw new Error('Invalid pillar data - recheck input.');
  }

  function isPresent(params) {
    const results = {};
    params.values.forEach((term) => {
      results[term.search[config.language]] = _.findIndex(
        _.map(processedPillars, pillar => pillar[term.type]),
        term.search,
      ) !== -1;
    });

    return results;
  }

  function calculate() {
    const score = {
      wood: 0,
      fire: 0,
      earth: 0,
      metal: 0,
      water: 0,
    };

    const repeats = _(processedPillars)
      .map(elem => elem.branch[config.language])
      .groupBy()
      .pickBy(elem => elem)
      .value();

    config.sets.forEach((set) => {
      // calculate matches
      if (_.every(isPresent(set))) {
        winston.info('found:', set.name);

        // calculate (x*y) combinations & mark used pillars
        let multiplier = 1;
        set.values.forEach((value) => {
          multiplier *= repeats[value.search[config.language]].length;
          _.filter(
            processedPillars,
            item => item[value.type][config.language] === value.search[config.language],
          ).forEach((pillar) => { pillar.used = true; });
        });

        score[set.type] += set.score * multiplier;
      }
    });

    console.info('current pillars:', processedPillars);

    // calculate unused remainders
    _.filter(processedPillars, { used: false }).forEach((pillar) => {
      winston.info(pillar, 'was unused, should add to', pillar.branch.elements);
      pillar.branch.elements.forEach((elem) => { score[elem] += config.unusedValue; });
    });

    return score;
  }

  return { calculate };
};

const test = FourPillars(
  // pillars
  {
    year: {
      stem: { english: 'gui' },
      branch: { english: 'you' },
    },
    month: {
      stem: { english: 'jia' },
      branch: { english: 'chen' },
    },
    day: {
      stem: { english: 'jia' },
      branch: { english: 'yin' },
    },
    hour: {
      stem: { english: 'ding' },
      branch: { english: 'mao' },
    },
  },

  // configuration for calculations
  {
    language: 'english',
    unusedValue: 10,
    sets: [
      {
        values: [
          { type: 'branch', search: { english: 'yin' } },
          { type: 'branch', search: { english: 'chen' } },
          { type: 'branch', search: { english: 'mao' } },
        ],
        type: 'wood',
        score: 100,
        name: '[branch] (yin-chen-mao) wood 100',
      },
      {
        values: [
          { type: 'branch', search: { english: 'si' } },
          { type: 'branch', search: { english: 'wu' } },
          { type: 'branch', search: { english: 'wei' } },
        ],
        type: 'fire',
        score: 100,
        name: '[branch] (si-wu-wei) fire 100',
      },
      {
        values: [
          { type: 'branch', search: { english: 'shen' } },
          { type: 'branch', search: { english: 'you' } },
          { type: 'branch', search: { english: 'xu' } },
        ],
        type: 'metal',
        score: 100,
        name: '[branch] (shen-you-xu) metal 100',
      },
      {
        values: [
          { type: 'branch', search: { english: 'hai' } },
          { type: 'branch', search: { english: 'zi' } },
          { type: 'branch', search: { english: 'chou' } },
        ],
        type: 'water',
        score: 100,
        name: '[branch] (hai-zi-chou) water 100',
      },
      {
        values: [
          { type: 'branch', search: { english: 'shen' } },
          { type: 'branch', search: { english: 'zi' } },
          { type: 'branch', search: { english: 'chen' } },
        ],
        type: 'water',
        score: 75,
        name: '[branch] (shen-zi-chen) water 75',
      },
      {
        values: [
          { type: 'branch', search: { english: 'hai' } },
          { type: 'branch', search: { english: 'mao' } },
          { type: 'branch', search: { english: 'wei' } },
        ],
        type: 'wood',
        score: 75,
        name: '[branch] (hai-mao-wei) wood 75',
      },
      {
        values: [
          { type: 'branch', search: { english: 'yin' } },
          { type: 'branch', search: { english: 'wu' } },
          { type: 'branch', search: { english: 'xu' } },
        ],
        type: 'fire',
        score: 75,
        name: '[branch] (yin-wu-xu) fire 75',
      },
      {
        values: [
          { type: 'branch', search: { english: 'si' } },
          { type: 'branch', search: { english: 'you' } },
          { type: 'branch', search: { english: 'chou' } },
        ],
        type: 'metal',
        score: 75,
        name: '[branch] (si-you-chou) metal 75',
      },
      {
        values: [
          { type: 'branch', search: { english: 'hai' } },
          { type: 'branch', search: { english: 'mao' } },
          { type: 'branch', search: { english: 'wei' } },
        ],
        type: 'wood',
        score: 75,
        name: '[branch] (hai-mao-wei) wood 75',
      },
      {
        values: [
          { type: 'branch', search: { english: 'chen' } },
          { type: 'branch', search: { english: 'xu' } },
          { type: 'branch', search: { english: 'chou' } },
          { type: 'branch', search: { english: 'wei' } },
        ],
        type: 'earth',
        score: 75,
        name: '[branch] (chen-xu-chou-wei) earth 75',
      },
      {
        values: [
          { type: 'branch', search: { english: 'shen' } },
          { type: 'branch', search: { english: 'zi' } },
        ],
        type: 'water',
        score: 50,
        name: '[branch] (shen-zi) water 50',
      },
      {
        values: [
          { type: 'branch', search: { english: 'zi' } },
          { type: 'branch', search: { english: 'chen' } },
        ],
        type: 'water',
        score: 50,
        name: '[branch] (zi-chen) water 50',
      },
      {
        values: [
          { type: 'branch', search: { english: 'hai' } },
          { type: 'branch', search: { english: 'mao' } },
        ],
        type: 'wood',
        score: 50,
        name: '[branch] (hai-mao) wood 50',
      },
      {
        values: [
          { type: 'branch', search: { english: 'mao' } },
          { type: 'branch', search: { english: 'wei' } },
        ],
        type: 'wood',
        score: 50,
        name: '[branch] (mao-wei) wood 50',
      },
      {
        values: [
          { type: 'branch', search: { english: 'yin' } },
          { type: 'branch', search: { english: 'wu' } },
        ],
        type: 'fire',
        score: 50,
        name: '[branch] (yin-wu) fire 50',
      },
      {
        values: [
          { type: 'branch', search: { english: 'wu' } },
          { type: 'branch', search: { english: 'xu' } },
        ],
        type: 'fire',
        score: 50,
        name: '[branch] (wu-xu) fire 50',
      },
      {
        values: [
          { type: 'branch', search: { english: 'si' } },
          { type: 'branch', search: { english: 'you' } },
        ],
        type: 'metal',
        score: 50,
        name: '[branch] (si-you) metal 50',
      },
      {
        values: [
          { type: 'branch', search: { english: 'you' } },
          { type: 'branch', search: { english: 'chou' } },
        ],
        type: 'metal',
        score: 50,
        name: '[branch] (you-chou) metal 50',
      },
      {
        values: [
          { type: 'branch', search: { english: 'zi' } },
          { type: 'branch', search: { english: 'chou' } },
        ],
        type: 'earth',
        score: 50,
        name: '[branch] (zi-chou) earth 50',
      },
      {
        values: [
          { type: 'branch', search: { english: 'yin' } },
          { type: 'branch', search: { english: 'hai' } },
        ],
        type: 'wood',
        score: 50,
        name: '[branch] (yin-hai) wood 50',
      },
      {
        values: [
          { type: 'branch', search: { english: 'mao' } },
          { type: 'branch', search: { english: 'xu' } },
        ],
        type: 'fire',
        score: 50,
        name: '[branch] (mao-xu) fire 50',
      },
      {
        values: [
          { type: 'branch', search: { english: 'chen' } },
          { type: 'branch', search: { english: 'you' } },
        ],
        type: 'metal',
        score: 50,
        name: '[branch] (chen-you) metal 50',
      },
      {
        values: [
          { type: 'branch', search: { english: 'si' } },
          { type: 'branch', search: { english: 'chen' } },
        ],
        type: 'water',
        score: 50,
        name: '[branch] (si-chen) water 50',
      },
      {
        values: [
          { type: 'branch', search: { english: 'wu' } },
          { type: 'branch', search: { english: 'wei' } },
        ],
        type: 'fire',
        score: 50,
        name: '[branch] (wu-wei) fire 50',
      },
    ],
  },
);

winston.info('score:', test.calculate());

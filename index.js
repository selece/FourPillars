const _ = require('lodash');

const SymbolGenerator = () => {
  const symbolCount = 60;
  const gen = combinedGenerator();
  const values = _.times(symbolCount, () => gen.next().value);

  function* seriesGenerator(values) {
    let current = 0;

    while (true) {
      yield values[current];

      current += 1;

      if (current >= values.length) {
        current = 0;
      }
    }
  }

  function* combinedGenerator() {
    let major = seriesGenerator([
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
    ]);

    let minor = seriesGenerator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

    while (true) {
      yield { major: major.next().value, minor: minor.next().value };
    }
  }

  function valueAt(index) {
    return values[index % values.length];
  }

  function valueOf({ major, minor }) {
    console.log(major, minor);
    const search = _.filter(values, { major: major, minor: minor });

    if (!search) {
      console.log('not found');
      return undefined;
    } else {
      console.log('found');
      return _.findIndex(values, { major: major, minor: minor });
    }
  }

  function validate(input) {
    return valueOf(input) !== undefined;
  }

  return { valueAt, valueOf, validate };
};

const ValueSet = (values) => {
  const remainderValue = 10;
  const paramSet = [
    {
      values: [3, 4, 5],
      type: 'Wood',
      score: 100
    },
    {
      values: [6, 7, 8],
      type: 'Fire',
      score: 100
    },
    {
      values: [9, 10, 11],
      type: 'Metal',
      score: 100
    },
    {
      values: [12, 1, 2],
      type: 'Water',
      score: 100
    },
    {
      values: [9, 1, 5],
      type: 'Water',
      score: 75
    },
    {
      values: [12, 4, 8],
      type: 'Wood',
      score: 75
    },
    {
      values: [3, 7, 11],
      type: 'Fire',
      score: 75
    },
    {
      values: [6, 10, 2],
      type: 'Metal',
      score: 75
    },
    {
      values: [12, 4, 8],
      type: 'Wood',
      score: 75
    },
    {
      values: [5, 11, 2, 8],
      type: 'Earth',
      score: 75
    },
    {
      values: [9, 1],
      type: 'Water',
      score: 50
    },
    {
      values: [1, 5],
      type: 'Water',
      score: 50
    },
    {
      values: [12, 4],
      type: 'Wood',
      score: 50
    },
    {
      values: [4, 8],
      type: 'Wood',
      score: 50
    },
    {
      values: [3, 7],
      type: 'Fire',
      score: 50
    },
    {
      values: [7, 11],
      type: 'Fire',
      score: 50
    },
    {
      values: [6, 10],
      type: 'Metal',
      score: 50
    },
    {
      values: [10, 2],
      type: 'Metal',
      score: 50
    },
    {
      values: [1, 2],
      type: 'Earth',
      score: 50
    },
    {
      values: [3, 12],
      type: 'Wood',
      score: 50
    },
    {
      values: [4, 11],
      type: 'Fire',
      score: 50
    },
    {
      values: [5, 10],
      type: 'Metal',
      score: 50
    },
    {
      values: [6, 9],
      type: 'Water',
      score: 50
    },
    {
      values: [7, 8],
      type: 'Fire',
      score: 50
    }
  ];

  const valueCounts = _(values)
    .groupBy()
    .pickBy(elem => elem)
    .value();

  const used = {};
  _.keys(valueCounts).forEach(key => used[key] = false);

  function isPresent(search) {
    const results = {};
    search.forEach(elem => results[elem] = _.indexOf(values, elem) !== -1);

    return results;
  }

  function calculate() {
    const score = {
      Wood: 0,
      Fire: 0,
      Earth: 0,
      Metal: 0,
      Water: 0,
    };

    // calculate matches
    paramSet.forEach(param => {
      if (_.every(isPresent(param.values))) {
        console.log('found:', param);

        // calculate multiplier (x * y) combinations
        let multiplier = 1;
        param.values.forEach(val => multiplier *= valueCounts[val].length);

        score[param.type] += param.score * multiplier;

        // mark used values
        param.values.forEach(val => used[val] = true);
        console.log('updated:', used);
      }
    });

    // calculate remainders
    _.filter(used, val => !val).forEach(val => {
      console.log(val, 'was not used, adding partial');
      //score.Remainders += remainderValue;
    });

    return score;
  }

  return { calculate };
};

const Pillar = () => {
  const LIMIT = 60;
  const cycle = Cycle();
  const cycleValues = _.times(LIMIT, () => cycle.next().value);

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
    let stems = LoopedGenerator([
      { chinese: '甲', english: 'jia' },
      { chinese: '乙', english: 'yi' },
      { chinese: '丙', english: 'bing' },
      { chinese: '丁', english: 'ding' },
      { chinese: '戊', english: 'wu' },
      { chinese: '己', english: 'ji' },
      { chinese: '庚', english: 'geng' },
      { chinese: '辛', english: 'xin' },
      { chinese: '壬', english: 'ren' },
      { chinese: '癸', english: 'gui' }
    ]);

    let branches = LoopedGenerator([
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
      { chinese: '亥', english: 'hai', elements: ['water', 'wood'] }
    ]);

    while (true) {
      yield {
        stem: stems.next().value,
        branch: branches.next().value
      }
    }
  }

  function valueAt(index) {
    return cycleValues[index % LIMIT];
  }

  function find({ stem, branch }) {
    const search = _.find(
      cycleValues,
      {
        stem: stem,
        branch: branch
      }
    );

    return search;
  }

  function indexOf({ stem, branch }) {
    return _.findIndex(cycleValues, find({stem, branch}));
  }

  function validate({ stem, branch }) {
    return find({stem, branch}) !== undefined;
  }

  return { valueAt, indexOf, find, validate };
};

const FourPillars = (pillars, config) => {

  // startup tasks - validate all pillar input, transform to full pillars
  pillars = _.map(pillars, pillar => {
    const ref = Pillar();
    return ref.find({
      stem: pillar.stem,
      branch: pillar.branch
    });
  });
  
  if (!_.every(pillars)) {
    throw new Error('Invalid pillar data - recheck input.');
  }

  function isPresent(params) {
    const results = {};
    params.values.forEach(term => {
      results[params.name] = _.findIndex(
        _.map(pillars, pillar => pillar[term.type]),
        term.search
      ) !== -1;
    });

    return results;
  }

  function calculate() {
    let score = {
      wood: 0,
      fire: 0,
      earth: 0,
      metal: 0,
      water: 0,
    };

    const repeats = _(pillars)
      .map(elem => elem.branch.english)
      .groupBy()
      .pickBy(elem => elem)
      .value();

    const used = [];

    config.sets.forEach(set => {

      // calculate matches
      if (_.every(isPresent(set))) {
        console.log('found:', set.name);

        // calculate (x*y) combinations 
        let multiplier = 1;
        set.values.forEach(val => multiplier *= repeats[val.search.english].length);
        score[set.type] += set.score * multiplier;

        // mark used values
        set.values.forEach(val => used.push(val.search.english));
      }

      // calculate unused remainders
      const remains = _.difference(_.keys(repeats), used);
      console.log('diff:', remains);

      console.log(
        _(pillars)
          .filter(elem => _.includes(remains, elem.branch.english))
          .value()
      );
    });

    return score;
  };

  return { calculate };
};

/*
let test = ValueSet([1, 4, 5, 11, 3, 8, 1, 8, 4]);
console.log('total score:', test.calculate());

let testGen = SymbolGenerator();
console.log(testGen.valueOf({ major: 'C', minor: 3 }));
*/

let test = FourPillars(
  // pillars
  {
    year: {
      stem: {english: 'gui'},
      branch: {english: 'you'}
    },
    month: {
      stem: {english: 'jia'},
      branch: {english: 'chen'}
    },
    day: {
      stem: {english: 'jia'},
      branch: {english: 'yin'}
    },
    hour: {
      stem: {english: 'ding'},
      branch: {english: 'mao'}
    }
  },

  // configuration for calculations
  {
    unusedScore: 10,
    sets: [
      {
        values: [
          {type: 'branch', search: { english: 'yin' }},
          {type: 'branch', search: { english: 'chen' }},
          {type: 'branch', search: { english: 'mao' }},
        ],
        type: 'wood',
        score: 100,
        name: 'test name, wood 100'
      }
    ]
  }
);

console.log(test.calculate());

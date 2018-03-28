const bem = require('postcss-bem');
const calc = require('postcss-calc');
const precss = require('precss');

const bemOptions = {
  defaultNamespace: undefined,
  style: 'suit',
  separators: {
    descendent: '__',
    modifier: '--'
  },
  shortcuts: {
    utility: 'u',
    component: 'b',
    descendent: 'e',
    modifier: 'm',
    when: 'is'
  }
};

module.exports = {
  style: {
    w: '100px'
  },
  compilers: {
    babel: true,
    typescript: {},
    less: {},
    postcss: {
      plugins: [
        bem(bemOptions),
        precss,
        calc
      ]
    },
    sass: {},
    stylus: {},
    pug: {}
  },
  alias: {
    components: './src/components'
  }
}

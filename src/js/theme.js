import { data } from './data.js';
import { state } from './state.js';
import { node } from './utilities/node.js';
import { convertColor } from './utilities/convertColor.js';
import { trimString } from './utilities/trimString.js';
import { ifValidString } from './utilities/ifValidString.js';

const theme = {};

theme.bind = {};

theme.bind.style = {
  initial: function() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(event) {
      theme.mod.style.initial();
    });
  }
};

theme.mod = {};

theme.mod.style = {
  initial: function() {
    switch (state.get.current().theme.style) {
      case 'dark':
      case 'light':
        localStorage.setItem(data.saveName + 'Style', state.get.current().theme.style);
        break;

      case 'system':
        if (window.matchMedia('(prefers-color-scheme:dark)').matches) {
          localStorage.setItem(data.saveName + 'Style', 'dark');
        } else if (window.matchMedia('(prefers-color-scheme:light)').matches) {
          localStorage.setItem(data.saveName + 'Style', 'light');
        };
        break;
    };
  },
  light: function() {
    state.get.current().theme.style = "light";
  },
  dark: function() {
    state.get.current().theme.style = "dark";
  }
};

theme.mod.color = {
  shades: function({ rgb = { r: 0, g: 0, b: 0 }, contrastNegative = 40, contrastPositive = 40 } = {}) {
    const shadeMax = 10;
    const shadeMin = 1;

    var hsl = convertColor.rgb.hsl(rgb);

    var validateRGBNumber = function(rgb) {
      for (var key in rgb) {
        if (rgb[key] < 0) {
          rgb[key] = 0;
        } else if (rgb[key] > 255) {
          rgb[key] = 255;
        };
        rgb[key] = Math.round(rgb[key]);
      };
      return rgb;
    };

    var shadeColors = {
      negative: {},
      positive: {}
    };

    // set light theme shades
    for (var i = shadeMax; i >= shadeMin; i--) {
      var rgb = convertColor.hsl.rgb({
        h: hsl.h,
        s: hsl.s,
        l: hsl.l - ((contrastNegative / 10) * i)
      });
      shadeColors.negative[i] = validateRGBNumber(rgb);
    };

    // set dark theme shades
    for (var i = shadeMin; i <= shadeMax; i++) {
      var rgb = convertColor.hsl.rgb({
        h: hsl.h,
        s: hsl.s,
        l: hsl.l + ((contrastPositive / 10) * i)
      });
      shadeColors.positive[i] = validateRGBNumber(rgb);
    };

    return shadeColors;
  },
  generated: function() {
    const shades = theme.mod.color.shades({
      rgb: state.get.current().theme.color.rgb,
      contrastNegative: state.get.current().theme.color.contrast.dark,
      contrastPositive: state.get.current().theme.color.contrast.light
    });
    state.get.current().theme.color.generated.negative = shades.negative;
    state.get.current().theme.color.generated.positive = shades.positive;
  }
};

theme.render = {};

theme.render.color = {};

theme.render.color.shade = function() {
  const html = document.querySelector('html');
  // negative
  for (var i = 10; i >= 1; i--) {
    var rgb = state.get.current().theme.color.generated.negative[i];
    var number = i;
    if (i < 10) {
      number = '0' + number;
    };
    html.style.setProperty('--theme-shade-negative-' + number, rgb.r + ', ' + rgb.g + ', ' + rgb.b);
  };
  // neutral
  var rgb = state.get.current().theme.color.rgb;
  html.style.setProperty('--theme-shade', rgb.r + ', ' + rgb.g + ', ' + rgb.b);
  // positive
  for (var i = 1; i <= 10; i++) {
    var rgb = state.get.current().theme.color.generated.positive[i];
    var number = i;
    if (i < 10) {
      number = '0' + number;
    };
    html.style.setProperty('--theme-shade-positive-' + number, rgb.r + ', ' + rgb.g + ', ' + rgb.b);
  };
};

theme.render.class = function() {
  const html = document.querySelector('html');

  if (state.get.current().bookmark.edit) {
    html.classList.add('is-bookmark-edit');
  } else {
    html.classList.remove('is-bookmark-edit');
  };

  const type = ['dark', 'light', 'system', 'theme', 'custom'];

  type.forEach((item, i) => {
    html.classList.remove('is-theme-style-' + item);
    html.classList.remove('is-theme-bookmark-shadow-color-type-' + item);
  });

  html.classList.add('is-theme-style-' + state.get.current().theme.style);
  html.classList.add('is-theme-bookmark-shadow-color-type-' + state.get.current().theme.bookmark.shadow.color.type);
};

theme.render.accent = {};

theme.render.accent.color = function() {
  const html = document.querySelector('html');
  const rgb = state.get.current().theme.accent.rgb;
  html.style.setProperty('--theme-accent-r', rgb.r);
  html.style.setProperty('--theme-accent-g', rgb.g);
  html.style.setProperty('--theme-accent-b', rgb.b);
};

theme.render.radius = function() {
  const html = document.querySelector('html');
  html.style.setProperty('--theme-radius', state.get.current().theme.radius);
};

theme.render.shadow = function() {
  const html = document.querySelector('html');
  html.style.setProperty('--theme-shadow', state.get.current().theme.shadow);
};

theme.style = {
  dark: function() {
    theme.mod.style.dark();
    theme.mod.style.initial();
    theme.render.class();
  },
  light: function() {
    theme.mod.style.light();
    theme.mod.style.initial();
    theme.render.class();
  },
  toggle: function() {
    if (state.get.current().theme.style == "dark") {
      theme.style.light();
    } else if (state.get.current().theme.style == "light") {
      theme.style.dark();
    };
  }
}

theme.render.bookmark = {};

theme.render.bookmark.style = function() {
  const html = document.querySelector('html');
  html.style.setProperty('--theme-bookmark-shadow-color', state.get.current().theme.bookmark.shadow.color.rgb.r + ', ' + state.get.current().theme.bookmark.shadow.color.rgb.g + ', ' + state.get.current().theme.bookmark.shadow.color.rgb.b);
  html.style.setProperty('--theme-bookmark-shadow-opacity', state.get.current().theme.bookmark.shadow.opacity);
};

theme.render.background = {};

theme.render.background.area = function() {
  const backgroundElement = node('div|class:theme-background');

  backgroundElement.appendChild(node('div|class:theme-background-type theme-background-type-theme'));
  backgroundElement.appendChild(node('div|class:theme-background-type theme-background-type-color'));
  backgroundElement.appendChild(node('div|class:theme-background-type theme-background-type-gradient'));
  backgroundElement.appendChild(node('div|class:theme-background-type theme-background-type-image'));

  document.querySelector('body').appendChild(backgroundElement);
};

theme.render.background.type = function() {
  const html = document.querySelector('html');

  const type = ['theme', 'color', 'gradient', 'image'];

  type.forEach((item, i) => {
    html.classList.remove('is-theme-background-type-' + item);
  });

  html.classList.add('is-theme-background-type-' + state.get.current().theme.background.type);
};

theme.render.background.style = function() {
  const html = document.querySelector('html');
  html.style.setProperty('--theme-background-color', state.get.current().theme.background.color.rgb.r + ', ' + state.get.current().theme.background.color.rgb.g + ', ' + state.get.current().theme.background.color.rgb.b);
  html.style.setProperty('--theme-background-gradient-angle', state.get.current().theme.background.gradient.angle);
  html.style.setProperty('--theme-background-gradient-angle', state.get.current().theme.background.gradient.angle);
  html.style.setProperty('--theme-background-gradient-start', state.get.current().theme.background.gradient.start.rgb.r + ', ' + state.get.current().theme.background.gradient.start.rgb.g + ', ' + state.get.current().theme.background.gradient.start.rgb.b);
  html.style.setProperty('--theme-background-gradient-end', state.get.current().theme.background.gradient.end.rgb.r + ', ' + state.get.current().theme.background.gradient.end.rgb.g + ', ' + state.get.current().theme.background.gradient.end.rgb.b);
  html.style.setProperty('--theme-background-image-blur', state.get.current().theme.background.image.blur);
  html.style.setProperty('--theme-background-image-scale', state.get.current().theme.background.image.scale);
  html.style.setProperty('--theme-background-image-opacity', state.get.current().theme.background.image.opacity);
  if (ifValidString(state.get.current().theme.background.image.url)) {
    html.style.setProperty('--theme-background-image', 'url(' + trimString(state.get.current().theme.background.image.url) + ')');
  } else {
    html.style.removeProperty('--theme-background-image');
  };
};

theme.init = function() {
  theme.mod.style.initial();
  theme.bind.style.initial();
  theme.mod.color.generated();
  theme.render.color.shade();
  theme.render.accent.color();
  theme.render.class();
  theme.render.radius();
  theme.render.shadow();
  theme.render.bookmark.style();
  theme.render.background.area();
  theme.render.background.type();
  theme.render.background.style();
};

export { theme };

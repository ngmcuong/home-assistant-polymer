import {
  LovelaceConfig,
  LovelaceCardConfig,
  LovelaceViewConfig,
} from "../../../data/lovelace";

export const addCard = (
  config: LovelaceConfig,
  path: [number],
  cardConfig: LovelaceCardConfig
): LovelaceConfig => {
  const [viewIndex] = path;
  const views: LovelaceViewConfig[] = [];

  config.views.forEach((viewConf, index) => {
    if (index !== viewIndex) {
      views.push(config.views[index]);
      return;
    }

    const cards = viewConf.cards
      ? [...viewConf.cards, cardConfig]
      : [cardConfig];

    views.push({
      ...viewConf,
      cards,
    });
  });

  return {
    ...config,
    views,
  };
};

export const replaceCard = (
  config: LovelaceConfig,
  path: [number, number],
  cardConfig: LovelaceCardConfig
): LovelaceConfig => {
  const [viewIndex, cardIndex] = path;
  const views: LovelaceViewConfig[] = [];

  config.views.forEach((viewConf, index) => {
    if (index !== viewIndex) {
      views.push(config.views[index]);
      return;
    }

    views.push({
      ...viewConf,
      cards: (viewConf.cards || []).map((origConf, ind) =>
        ind === cardIndex ? cardConfig : origConf
      ),
    });
  });

  return {
    ...config,
    views,
  };
};

export const deleteCard = (
  config: LovelaceConfig,
  path: [number, number]
): LovelaceConfig => {
  const [viewIndex, cardIndex] = path;
  const views: LovelaceViewConfig[] = [];

  config.views.forEach((viewConf, index) => {
    if (index !== viewIndex) {
      views.push(config.views[index]);
      return;
    }

    views.push({
      ...viewConf,
      cards: (viewConf.cards || []).filter(
        (_origConf, ind) => ind !== cardIndex
      ),
    });
  });

  return {
    ...config,
    views,
  };
};

export const swapCard = (
  config: LovelaceConfig,
  path1: [number, number],
  path2: [number, number]
): LovelaceConfig => {
  const card1 = config.views[path1[0]].cards![path1[1]];
  const card2 = config.views[path2[0]].cards![path2[1]];

  const origView1 = config.views[path1[0]];
  const newView1 = {
    ...origView1,
    cards: origView1.cards!.map((origCard, index) =>
      index === path1[1] ? card2 : origCard
    ),
  };

  const origView2 = path1[0] === path2[0] ? newView1 : config.views[path2[0]];
  const newView2 = {
    ...origView2,
    cards: origView2.cards!.map((origCard, index) =>
      index === path2[1] ? card1 : origCard
    ),
  };

  return {
    ...config,
    views: config.views.map((origView, index) =>
      index === path2[0] ? newView2 : index === path1[0] ? newView1 : origView
    ),
  };
};

export const addView = (
  config: LovelaceConfig,
  viewConfig: LovelaceViewConfig
): LovelaceConfig => ({
  ...config,
  views: config.views.concat(viewConfig),
});

export const replaceView = (
  config: LovelaceConfig,
  viewIndex: number,
  viewConfig: LovelaceViewConfig
): LovelaceConfig => ({
  ...config,
  views: config.views.map((origView, index) =>
    index === viewIndex ? viewConfig : origView
  ),
});

export const deleteView = (
  config: LovelaceConfig,
  viewIndex: number
): LovelaceConfig => ({
  ...config,
  views: config.views.filter((_origView, index) => index !== viewIndex),
});
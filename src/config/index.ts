export interface IAppConfig {
  apiBaseUrl: string;
}

const config: IAppConfig = {
  apiBaseUrl: import.meta.env.API_BASE_URL || "https://staging01-app.lekiosquenumerique.fr/api",
};

export default config;

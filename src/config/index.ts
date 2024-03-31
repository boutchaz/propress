export interface IAppConfig {
  apiBaseUrl: string;
}

const config: IAppConfig = {
  apiBaseUrl: import.meta.env.API_BASE_URL || "https://d28r9ja8pir71l.cloudfront.net/api",
};

export default config;

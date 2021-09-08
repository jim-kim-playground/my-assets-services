import { ExchangeRateResponseModel, Quote } from "../models/exchange-rates";
import { Get, Query, Route } from "tsoa";
import Logger from "../configurations/logger";

const yahooFinance = require("yahoo-finance");

// TODO dollar index API

@Route("/api/exchange-rates")
class ExchangeRatesController {
  /**
   * symbol: TICKER
   * period: "d", // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
   */
  @Get("/")
  async getExchangeRates(
    @Query() from: Date = new Date(),
    @Query() to: Date = new Date(),
    @Query() symbols: Array<string> = ["DX-Y.NYB", "KRW=X"],
    @Query() period: string = "d"
  ): Promise<ExchangeRateResponseModel> {
    Logger.debug("[ExchangeRatesController] getExchangeRates");

    const result = await this.getHistoricalData(symbols, from, to, period);

    return new Promise<ExchangeRateResponseModel>((resolve) => {
      resolve(result);
    });
  }

  private async getHistoricalData(
    symbols: Array<string>,
    from: Date,
    to: Date,
    period: string
  ): Promise<ExchangeRateResponseModel> {
    const response = await yahooFinance.historical({
      symbols,
      from: from.toISOString(),
      to: to.toISOString(),
      period,
    });

    const result: ExchangeRateResponseModel = {
      quotes: [],
    };

    for (const symbol of symbols) {
      result.quotes.push({
        symbol,
        value: await response[symbol].filter((quote: Quote) => {
          if (quote.close !== null) return true;

          return false;
        }),
      });
    }

    return result;
  }
}

export default ExchangeRatesController;

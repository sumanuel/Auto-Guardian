const mockLocales = jest.fn();
const mockCalendars = jest.fn();
jest.mock("expo-localization", () => ({
  getLocales: () => mockLocales(),
  getCalendars: () => mockCalendars(),
}));

import {
  cleanPhoneNumber,
  formatPhoneForWhatsApp,
  getCountryPhoneCode,
} from "../utils/phoneUtils";

beforeEach(() => {
  mockLocales.mockReturnValue([{ regionCode: "VE", languageTag: "es-VE" }]);
  mockCalendars.mockReturnValue([{ timeZone: "America/Caracas" }]);
});

describe("phoneUtils", () => {
  test("usa la región del dispositivo", () => {
    expect(getCountryPhoneCode()).toBe("58");
  });

  test("si no hay región usa el locale y luego la zona horaria", () => {
    mockLocales.mockReturnValue([{ regionCode: null, languageTag: "es-MX" }]);
    expect(getCountryPhoneCode()).toBe("52");
    mockLocales.mockReturnValue([{ regionCode: null, languageTag: "es" }]);
    mockCalendars.mockReturnValue([{ timeZone: "America/Lima" }]);
    expect(getCountryPhoneCode()).toBe("51");
  });

  test("formatea para WhatsApp", () => {
    expect(formatPhoneForWhatsApp("(414) 123-4567")).toBe("584141234567");
    expect(formatPhoneForWhatsApp("+58 414 1234567")).toBe("584141234567");
    expect(formatPhoneForWhatsApp("")).toBe("");
  });

  test("cleanPhoneNumber quita espacios, guiones y paréntesis", () => {
    expect(cleanPhoneNumber("(414) 123-45 67")).toBe("4141234567");
  });
});

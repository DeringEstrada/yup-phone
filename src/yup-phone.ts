import * as Yup from 'yup';
import * as gPhoneNumber from 'google-libphonenumber';

const phoneUtil = gPhoneNumber.PhoneNumberUtil.getInstance();

declare module 'yup' {
  export interface StringSchema {
    phone(countryCode?: string, strict?: boolean): StringSchema;
  }
}

const YUP_PHONE_METHOD = 'phone';
const CLDR_REGION_CODE_SIZE = 2;

const isValidCountryCode = (countryCode: any): boolean =>
  typeof countryCode === 'string' &&
  countryCode.length === CLDR_REGION_CODE_SIZE;

Yup.addMethod(Yup.string, YUP_PHONE_METHOD, function yupPhone(
  countryCode?: string,
  strict: boolean = false,
) {
  const errMsg = isValidCountryCode(countryCode)
    ? `\${path} must be a valid phone number for region ${countryCode}`
    : '${path} must be a valid phone number.';
  // @ts-ignore
  return this.test(YUP_PHONE_METHOD, errMsg, (value: string) => {
    if (!isValidCountryCode(countryCode)) {
      // if not valid countryCode, then set default country to India (IN)
      countryCode = 'IN';
      strict = false;
    }

    const phoneNumber = phoneUtil.parseAndKeepRawInput(value, countryCode);

    if (!phoneUtil.isPossibleNumber(phoneNumber)) {
      return false;
    }

    const regionCodeFromPhoneNumber = phoneUtil.getRegionCodeForNumber(
      phoneNumber,
    );

    /* check if the countryCode provided should be used as
       default country code or strictly followed
     */
    return strict
      ? phoneUtil.isValidNumberForRegion(phoneNumber, countryCode)
      : phoneUtil.isValidNumberForRegion(
        phoneNumber,
        regionCodeFromPhoneNumber,
        );
  });
});

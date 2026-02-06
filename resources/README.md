# Resources

This folder contains static resource files and configuration data used by the
spending tracker application. These files typically contain reference data that
doesn't change frequently and is loaded at runtime to support various features
of the application.

## Files

| Filename                  | Description                                                                                                                                                                   | Source                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `indonesia-holidays.json` | List of Indonesia public holidays for the year, used to adjust payday calculations when paydays fall on holidays or weekends. **Note:** This file needs to be updated yearly. | [https://libur.deno.dev/](https://libur.deno.dev/) |

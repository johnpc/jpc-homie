# Temperature Page Updates - Setup Instructions

## Changes Made

1. Created `/app/api/humidity/route.ts` - Fetches humidity from Home Assistant
2. Created `/app/api/fan/route.ts` - Gets fan status and controls fan via Home Assistant
3. Updated `/components/Temperature.tsx` - Added humidity display and fan control UI

## Home Assistant Configuration

Add these to your `config.yml`:

### Sensors (add to existing REST sensor section):

```yaml
- name: "Thermostat Humidity"
  value_template: "{{ value_json.state['shared.' + value_json.device.serial].value.current_humidity }}"
  unit_of_measurement: "%"
  device_class: humidity
- name: "Thermostat Fan"
  value_template: "{{ value_json.state['shared.' + value_json.device.serial].value.hvac_fan_state }}"
```

### Rest Command (add new section if not exists):

```yaml
rest_command:
  set_thermostat_fan:
    url: "https://nolongerevil.com/api/v1/thermostat/a3b793fd-e78d-4d1d-8b34-e24b2887cfa8/fan"
    method: POST
    headers:
      Authorization: "Bearer nle_083e8ca4618a8e9cf33db89fe52fe4786dd9abae345c5e4973bd7c01e0a0d684"
      Content-Type: "application/json"
    payload: '{"state": {{ state }}}'
```

## Testing

After updating:
1. Update Home Assistant `config.yml` with the new sensors and rest_command
2. Restart Home Assistant
3. Restart your Next.js app
4. Visit `/temperature` page to see humidity and fan controls

## UI Features

- Humidity percentage display
- Fan on/off status indicator
- Toggle button to turn fan on/off
- Loading states during updates

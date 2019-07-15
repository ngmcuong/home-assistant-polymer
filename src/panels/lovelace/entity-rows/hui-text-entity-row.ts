import {
  html,
  LitElement,
  TemplateResult,
  property,
  CSSResult,
  css,
  customElement,
  PropertyValues,
} from "lit-element";

import "../components/hui-generic-entity-row";
import "../components/hui-warning";

import computeStateDisplay from "../../../common/entity/compute_state_display";

import { HomeAssistant } from "../../../types";
import { EntityRow, EntityConfig } from "./types";
import { hasConfigOrEntityChanged } from "../common/has-changed";

@customElement("hui-text-entity-row")
class HuiTextEntityRow extends LitElement implements EntityRow {
  @property() public hass?: HomeAssistant;

  @property() private _config?: EntityConfig;

  public setConfig(config: EntityConfig): void {
    if (!config) {
      throw new Error("Configuration error");
    }
    this._config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  private _generateClassnameForBinaryMovementSensor(stateObj: any): string {
    console.log("stateObj", stateObj);
    if (stateObj.state === 'on') {
      return 'motion_detected';
    }
    return '';
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    const stateObj = this.hass.states[this._config.entity];

    if (!stateObj) {
      return html`
        <hui-warning
          >${this.hass.localize(
            "ui.panel.lovelace.warning.entity_not_found",
            "entity",
            this._config.entity
          )}</hui-warning
        >
      `;
    }

    let className = '';
    const { attributes = {} } = stateObj;
    if (attributes.device_class === 'motion') {
      className = this._generateClassnameForBinaryMovementSensor(stateObj);
    }

    return html`
      <hui-generic-entity-row .hass="${this.hass}" .config="${this._config}">
        <div class="${className}">
          ${computeStateDisplay(
            this.hass!.localize,
            stateObj,
            this.hass.language
          )}
        </div>
      </hui-generic-entity-row>
    `;
  }

  static get styles(): CSSResult {
    return css`
      div {
        text-align: right;
      }
      
      .motion_detected {
        color: var(--primary-color);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-text-entity-row": HuiTextEntityRow;
  }
}

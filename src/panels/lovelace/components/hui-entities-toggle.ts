import {
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
  customElement,
  property,
  css,
  CSSResult,
} from "lit-element";
import { PaperToggleButtonElement } from "@polymer/paper-toggle-button/paper-toggle-button";

import { DOMAINS_TOGGLE } from "../../../common/const";
import { turnOnOffEntities } from "../common/entity/turn-on-off-entities";
import { HomeAssistant } from "../../../types";
import { forwardHaptic } from "../../../util/haptics";

@customElement("hui-entities-toggle")
class HuiEntitiesToggle extends LitElement {
  constructor() {
    super();
    this._isToggleOn = false;
  }

  @property() public entities?: string[];

  @property() protected hass?: HomeAssistant;

  @property() private _toggleEntities?: string[];

  @property() private _isToggleOn?: boolean;

  public updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has("entities")) {
      this._toggleEntities = this.entities!.filter(
        (entityId) =>
          entityId in this.hass!.states &&
          DOMAINS_TOGGLE.has(entityId.split(".", 1)[0])
      );
    }
  }

  private _isOn(): boolean {
    return this._toggleEntities!.some((entityId) => {
          const stateObj = this.hass!.states[entityId];
          return stateObj && stateObj.state === "on";
        });
  }

  protected render(): TemplateResult | void {
    if (!this._toggleEntities) {
      return html``;
    }

    return html`
      <paper-toggle-button
        ?checked="${this._isOn()}"
        @change="${this._callService}"
        class="${(this._isOn() || this._isToggleOn) ? 'on' : 'off'}"
      ></paper-toggle-button>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        width: 50px;
        display: block;
        margin: auto 0;
      }
      
      paper-toggle-button {
        cursor: pointer;
        --paper-toggle-button-label-spacing: 0;
        padding: 3px;
        margin: -5px 5px;
        background-color: #999999;
        width: 50px;
        border-radius: 16px;
        
        --paper-toggle-button-checked-button-color: white;
        --paper-toggle-button-unchecked-button-color: white;
        --paper-toggle-button-checked-bar-color: var(--primary-color);
        --paper-toggle-button-unchecked-bar-color: #999999;
      }
      paper-toggle-button.on {
        background-color: var(--primary-color);
      }
      paper-toggle-button.on::before {
        content: '';
        width: 13px;
      }
    `;
  }

  private _callService(ev: MouseEvent): void {
    forwardHaptic(this, "light");
    const turnOn = (ev.target as PaperToggleButtonElement).checked;
    turnOnOffEntities(this.hass!, this._toggleEntities!, turnOn!);
    this._isToggleOn = turnOn!;

  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-entities-toggle": HuiEntitiesToggle;
  }
}

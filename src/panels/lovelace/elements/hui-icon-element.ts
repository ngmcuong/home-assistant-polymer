import {
  html,
  LitElement,
  TemplateResult,
  property,
  css,
  CSSResult,
  customElement,
} from "lit-element";

import "../../../components/ha-icon";

import { computeTooltip } from "../common/compute-tooltip";
import { handleClick } from "../common/handle-click";
import { longPress } from "../common/directives/long-press-directive";
import { LovelaceElement, IconElementConfig } from "./types";
import { HomeAssistant } from "../../../types";

@customElement("hui-icon-element")
export class HuiIconElement extends LitElement implements LovelaceElement {
  public hass?: HomeAssistant;
  @property() private _config?: IconElementConfig;

  public setConfig(config: IconElementConfig): void {
    if (!config.icon) {
      throw Error("Invalid Configuration: 'icon' required");
    }

    this._config = config;
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    return html`
      <ha-icon
        .icon="${this._config.icon}"
        .title="${computeTooltip(this.hass, this._config)}"
        @ha-click="${this._handleTap}"
        @ha-hold="${this._handleHold}"
        .longPress="${longPress()}"
      ></ha-icon>
    `;
  }

  private _handleTap(): void {
    handleClick(this, this.hass!, this._config!, false);
  }

  private _handleHold(): void {
    handleClick(this, this.hass!, this._config!, true);
  }

  static get styles(): CSSResult {
    return css`
      :host {
        cursor: pointer;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-icon-element": HuiIconElement;
  }
}

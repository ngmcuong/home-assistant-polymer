import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
  css,
  CSSResult,
  PropertyValues,
} from "lit-element";
import { classMap } from "lit-html/directives/class-map";

import "../../../components/ha-card";
import "../components/hui-image";
import "../components/hui-warning";

import computeDomain from "../../../common/entity/compute_domain";
import computeStateDisplay from "../../../common/entity/compute_state_display";
import computeStateName from "../../../common/entity/compute_state_name";

import { longPress } from "../common/directives/long-press-directive";
import { HomeAssistant } from "../../../types";
import { LovelaceCard } from "../types";
import { handleClick } from "../common/handle-click";
import { UNAVAILABLE } from "../../../data/entity";
import { hasConfigOrEntityChanged } from "../common/has-changed";
import { PictureEntityCardConfig } from "./types";

@customElement("hui-picture-entity-card")
class HuiPictureEntityCard extends LitElement implements LovelaceCard {
  @property() public hass?: HomeAssistant;

  @property() private _config?: PictureEntityCardConfig;

  public getCardSize(): number {
    return 3;
  }

  public setConfig(config: PictureEntityCardConfig): void {
    if (!config || !config.entity) {
      throw new Error("Invalid Configuration: 'entity' required");
    }

    if (
      computeDomain(config.entity) !== "camera" &&
      (!config.image && !config.state_image && !config.camera_image)
    ) {
      throw new Error("No image source configured.");
    }

    this._config = { show_name: true, show_state: true, ...config };
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps);
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

    const name = this._config.name || computeStateName(stateObj);
    const state = computeStateDisplay(
      this.hass!.localize,
      stateObj,
      this.hass.language
    );

    let header: TemplateResult | string = "";
    if (this._config.show_name && this._config.show_state) {
      header = html`
        <div class="header both">
          <div>${name}</div>
          <div>${state}</div>
          <ha-icon icon="hass:dots-vertical"></ha-icon>
        </div>
      `;
    } else if (this._config.show_name) {
      header = html`
        <div class="header">${name}</div>
      `;
    } else if (this._config.show_state) {
      header = html`
        <div class="header state">${state}</div>
      `;
    }

    return html`
      <div class="wrapper">
      ${header}
      <div class="empty-space"></div>
      <ha-card>
        <hui-image
          .hass="${this.hass}"
          .image="${this._config.image}"
          .stateImage="${this._config.state_image}"
          .cameraImage="${computeDomain(this._config.entity) === "camera"
            ? this._config.entity
            : this._config.camera_image}"
          .cameraView="${this._config.camera_view}"
          .entity="${this._config.entity}"
          .aspectRatio="${this._config.aspect_ratio}"
          @ha-click="${this._handleTap}"
          @ha-hold="${this._handleHold}"
          .longPress="${longPress()}"
          class="${classMap({
            clickable: stateObj.state !== UNAVAILABLE,
          })}"
        ></hui-image>
      </ha-card>
      <div class="dark-background"></div>
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      ha-card {
        min-height: 75px;
        overflow: hidden;
        position: relative;
        
        box-shadow: 0 6px 6px rgba(0, 0, 0, 0.3);
        z-index: 2;
      }
      
      .wrapper {
        position: relative;
        margin: 16px;
        height: 95%;
      }
      
      .empty-space {
        height: 25%;
      }
      
      .dark-background {
        height: 100%;
        width: 100%;
        background: black;
        position: absolute;
        top: 0;
        left: 0;
        opacity: .8;
        z-index: 1;
        border-radius: 5px;
      }

      hui-image.clickable {
        cursor: pointer;
      }

      .header {
        /* start paper-font-common-nowrap style */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        /* end paper-font-common-nowrap style */

        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        background-color: rgba(0, 0, 0, 0.3);
        padding: 16px;
        font-size: 16px;
        line-height: 16px;
        color: white;
        z-index: 3;
      }

      .both {
        display: flex;
        justify-content: space-between;
      }

      .state {
        text-align: right;
      }
    `;
  }

  private _handleTap() {
    handleClick(this, this.hass!, this._config!, false);
  }

  private _handleHold() {
    handleClick(this, this.hass!, this._config!, true);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-picture-entity-card": HuiPictureEntityCard;
  }
}

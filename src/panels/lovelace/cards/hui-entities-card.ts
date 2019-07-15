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

import "../../../components/ha-card";
import "../../../components/ha-icon";
import "../components/hui-entities-toggle";

import { fireEvent } from "../../../common/dom/fire_event";
import { DOMAINS_HIDE_MORE_INFO } from "../../../common/const";
import { HomeAssistant } from "../../../types";
import { EntityRow } from "../entity-rows/types";
import { LovelaceCard, LovelaceCardEditor } from "../types";
import { processConfigEntities } from "../common/process-config-entities";
import { createRowElement } from "../common/create-row-element";
import { EntitiesCardConfig, EntitiesCardEntityConfig } from "./types";

import computeDomain from "../../../common/entity/compute_domain";
import applyThemesOnElement from "../../../common/dom/apply_themes_on_element";

const icons = {
  fan: "hass:fan",
  light: "hass:lightbulb",
  switch: "hass:flash",
  lock: "hass:lock",
  binary_sensor: "hass:run",
};

@customElement("hui-entities-card")
class HuiEntitiesCard extends LitElement implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import(/* webpackChunkName: "hui-entities-card-editor" */ "../editor/config-elements/hui-entities-card-editor");
    return document.createElement("hui-entities-card-editor");
  }

  public static getStubConfig(): object {
    return { entities: [] };
  }

  @property() protected _config?: EntitiesCardConfig;

  protected _hass?: HomeAssistant;

  protected _configEntities?: EntitiesCardEntityConfig[];

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this.shadowRoot!.querySelectorAll("#states > div > *").forEach(
      (element: unknown) => {
        (element as EntityRow).hass = hass;
      }
    );
    const entitiesToggle = this.shadowRoot!.querySelector(
      "hui-entities-toggle"
    );
    if (entitiesToggle) {
      (entitiesToggle as any).hass = hass;
    }
  }

  public getCardSize(): number {
    if (!this._config) {
      return 0;
    }
    // +1 for the header
    return (this._config.title ? 1 : 0) + this._config.entities.length;
  }

  public setConfig(config: EntitiesCardConfig): void {
    const entities = processConfigEntities(config.entities);

    this._config = { theme: "default", ...config };
    this._configEntities = entities;
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (this._hass && this._config) {
      applyThemesOnElement(this, this._hass.themes, this._config.theme);
    }
  }

  protected _renderIcon(type: any  | string): TemplateResult {
    console.log("entities", type);
    let iconType = '';
    if (typeof type === 'object') {
      iconType = type.entity.toString().split('.')[0];
    } else {
      iconType = type.toString().split('.')[0];
    }
    if (iconType === 'cover') {
      return html`<img src="/static/icons/ic_door.png" alt="door icon" class="icon"/>`;
    }
    if (!icons[iconType]) {
      return html``;
    }

    return html`
      <ha-icon
        class="icon"
        icon="${icons[iconType]}"
      ></ha-icon>
    `;
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this._hass) {
      return html``;
    }
    const { show_header_toggle, title, entities } = this._config;

    const icon = this._renderIcon(entities[0]);

    return html`
      <div class="wrapper">
        <ha-card>
          ${!title && !show_header_toggle
            ? html``
            : html`
                <div class="header">
                  <div class="name">${icon}${title}</div>
                  ${show_header_toggle === false
                    ? html``
                    : html`
                        <hui-entities-toggle
                          .hass="${this._hass}"
                          .entities="${this._configEntities!.map(
                            (conf) => conf.entity
                          )}"
                        ></hui-entities-toggle>
                      `}
                </div>
              `}
          <div id="states">
            ${this._configEntities!.map((entityConf) =>
              this.renderEntity(entityConf)
            )}
          </div>
        </ha-card>
        <div class="clear-background"></div>
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .wrapper {
        position: relative;
        margin: 16px;
        height: 97%;
      }
      
      .clear-background {
        height: 100%;
        width: 100%;
        background: white;
        position: absolute;
        top: 0;
        left: 0;
        opacity: .8;
        z-index: 1;
        border-radius: 5px;
      }
      
      ha-card {
        height: 100%;
        position: relative;
        background: transparent;
        box-shadow: 0 6px 6px rgba(0, 0, 0, 0.3);
        border-radius: 5px;
        z-index: 2;
        overflow-y: auto;
      }
      
      ha-card::-webkit-scrollbar {
        background-color: transparent;
        max-height: 0;
      }

      #states {
        margin: -4px 0;
        padding: 16px;
      }

      #states > * {
        margin: 8px 0;
      }

      #states > div > * {
        overflow: hidden;
      }
      
      .background {
        background: #000;
      }

      .header {
        /* start paper-font-headline style */
        font-family: "Roboto", "Noto", sans-serif;
        -webkit-font-smoothing: antialiased; /* OS X subpixel AA bleed bug */
        text-rendering: optimizeLegibility;
        font-size: 24px;
        font-weight: 400;
        letter-spacing: -0.012em;
        /* end paper-font-headline style */

        line-height: 40px;
        color: var(--primary-text-color);
        padding: 4px 16px 12px;
        display: flex;
        justify-content: space-between;
      }

      .header .name {
        /* start paper-font-common-nowrap style */
        display: flex;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 18px;
        font-weight: 600;
        align-items: center;
        /* end paper-font-common-nowrap */
      }

      .state-card-dialog {
        cursor: pointer;
      }
      
      .icon {
        color: #FC313E;
        padding-right: 8px;
      }
    `;
  }

  private renderEntity(entityConf: EntitiesCardEntityConfig): TemplateResult {
    const element = createRowElement(entityConf);
    if (this._hass) {
      element.hass = this._hass;
    }
    if (
      entityConf.entity &&
      !DOMAINS_HIDE_MORE_INFO.includes(computeDomain(entityConf.entity))
    ) {
      element.classList.add("state-card-dialog");
      element.addEventListener("click", () => this._handleClick(entityConf));
    }

    return html`
      <div>${element}</div>
      <div class="background"></div>
    `;
  }

  private _handleClick(entityConf: EntitiesCardEntityConfig): void {
    const entityId = entityConf.entity;
    fireEvent(this, "hass-more-info", { entityId });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-entities-card": HuiEntitiesCard;
  }
}

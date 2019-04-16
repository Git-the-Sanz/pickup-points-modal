import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl, intlShape } from 'react-intl'
import { SHOW_MAP, HIDE_MAP, INSIDE_MODAL } from '../constants'
import classNames from 'classnames'
import { translate } from '../utils/i18nUtils'
import { getShipsTo } from '../utils/AddressUtils'
import AddressShapeWithValidation from '@vtex/address-form/lib/propTypes/AddressShapeWithValidation'
import PickupPoint from './PickupPoint'
import PickupSidebarHeader from './PickupSidebarHeader'
import PickupPointDetails from './PickupPointDetails'
import Input from './Input'
import PickupTabs from './PickupTabs'
import GeolocationStatus from './GeolocationStatus'
import SearchForm from './SearchForm'

import PinWaiting from '../assets/components/PinWaiting'
import AskForGeolocation from './AskForGeolocation'
import Error from './Error'

import styles from './PickupSidebar.css'

class PickupSidebar extends Component {
  render() {
    const {
      activePickupPoint,
      changeActivePickupDetails,
      changeActivePickupPointId,
      changeActiveSLAOption,
      closePickupPointsModal,
      errorStatus,
      geolocationFrom,
      googleMaps,
      intl,
      isPickupDetailsActive,
      isLargeScreen,
      isLoading,
      items,
      logisticsInfo,
      mapStatus,
      onHandleAddressChange,
      pickupOptions,
      pickupPoints,
      rules,
      searchAddress,
      sellerId,
      selectedPickupPoint,
      shouldUseMaps,
      showAskForGeolocation,
      showError,
      storePreferencesData,
      togglePickupDetails,
      updateLocationTab,
    } = this.props

    const isNotShowingPickupDetailsAndHasPickupOptions =
      pickupOptions.length > 0 &&
      !isPickupDetailsActive &&
      (mapStatus === HIDE_MAP || isLargeScreen)

    const hasPickups = pickupOptions.length !== 0
    const isInsideModal = geolocationFrom === INSIDE_MODAL

    return (
      <div
        className={classNames(
          shouldUseMaps ? styles.infoBar : styles.infoBarPostalCode,
          'pkpmodal-info-bar', {
            'pkpmodal-info-bar-map': mapStatus === SHOW_MAP,
          })}>
        <div
          className={classNames(
            styles.infoBarContainer,
            'pkpmodal-info-bar-container',
            {
              infoBarContainerActive: mapStatus === SHOW_MAP,
            }
          )}>
          <PickupSidebarHeader isPickupDetailsActive={isPickupDetailsActive} />
          {!isPickupDetailsActive && shouldUseMaps && (
            <SearchForm
              address={searchAddress}
              googleMaps={googleMaps}
              Input={Input}
              isLoadingGoogle={isLoading}
              isGeolocation={shouldUseMaps}
              onAskForGeolocationStatus={this.props.onAskForGeolocationStatus}
              onChangeAddress={onHandleAddressChange}
              onHandleAskForGeolocation={this.props.onHandleAskForGeolocation}
              placeholder={translate(intl, 'searchLocationMap')}
              rules={rules}
              shipsTo={getShipsTo(intl, logisticsInfo)}
              setGeolocationFrom={this.props.setGeolocationFrom}
            />
          )}

          {!isPickupDetailsActive &&
            hasPickups &&
            shouldUseMaps && (
            <div className={`${styles.tabsContainer} pickup-tabs-container`}>
              <PickupTabs
                mapStatus={mapStatus}
                updateLocationTab={updateLocationTab}
              />
            </div>
          )}

          {!showAskForGeolocation &&
            !showError &&
            !isPickupDetailsActive &&
            !hasPickups && (
            <div
              className={`${
                shouldUseMaps ? styles.locatingWrapper : styles.locatingPostalCodeWrapper
              } pkpmodal-locating-wrapper`}>
              <GeolocationStatus
                Image={() => (
                  <div>
                    <div className="pkpmodal-locating-image-waiting">
                      <PinWaiting />
                    </div>
                    <div className="pkpmodal-locating-image-waiting-shadow" />
                  </div>
                )}
                subtitleBottom={shouldUseMaps ? 'geolocationEmptyInstructions' : 'postalCodeEmptyInstructions'}
                titleBottom="geolocationEmpty"
              />
            </div>
          )}

          {!isPickupDetailsActive &&
            !hasPickups &&
            !shouldUseMaps && (
            <SearchForm
              address={searchAddress}
              googleMaps={googleMaps}
              Input={Input}
              isLoadingGoogle={isLoading}
              isGeolocation={shouldUseMaps}
              onAskForGeolocationStatus={this.props.onAskForGeolocationStatus}
              onChangeAddress={onHandleAddressChange}
              onHandleAskForGeolocation={this.props.onHandleAskForGeolocation}
              placeholder={translate(intl, 'searchLocationMap')}
              rules={rules}
              shipsTo={getShipsTo(intl, logisticsInfo)}
              setGeolocationFrom={this.props.setGeolocationFrom}
            />
          )}

          {showAskForGeolocation &&
            isInsideModal && (
            <AskForGeolocation
              address={searchAddress}
              askForGeolocation={this.props.showAskForGeolocation}
              geolocationFrom={INSIDE_MODAL}
              googleMaps={googleMaps}
              onAskForGeolocation={this.props.onHandleAskForGeolocation}
              onAskForGeolocationStatus={this.props.onAskForGeolocationStatus}
              onChangeAddress={this.props.onHandleAddressChange}
              onGeolocationError={this.props.onGeolocationError}
              onManualGeolocation={this.props.onManualGeolocation}
              rules={rules}
              status={this.props.askForGeolocationStatus}
            />
          )}

          {showError &&
            isInsideModal && (
            <Error
              onManualGeolocationError={this.props.onManualGeolocationError}
              status={errorStatus}
            />
          )}

          {!showAskForGeolocation &&
            !showError &&
            isNotShowingPickupDetailsAndHasPickupOptions && (
            <div className={`${styles.locationSummary} pkpmodal-location-summary`}>
              <svg className={`${styles.locationSummaryIcon} pkpmodal-location-summary-icon`} height="16" version="1.1" viewBox="0 0 48 48" width="16" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px">
                <path d="M24,1.11224c-9.38879,0-17,7.61115-17,17 c0,10.1424,12.87262,23.22955,16.2149,26.4566c0.44031,0.42517,1.12988,0.42517,1.57025,0C28.12744,41.3418,41,28.25464,41,18.11224 C41,8.72339,33.38879,1.11224,24,1.11224z" fill="#999" stroke="#ffffff"></path>
                <circle cx="24" cy="18" fill="#FFFFFF" r="6"></circle>
              </svg>
              <div className={`${styles.locationSummaryText} pkpmodal-location-summary-btn`}>
                {translate(intl, 'nearTo')} Praia de Botafogo
              </div>
              <button type="button" className={`${styles.locationReset} pkpmodal-location-reset btn btn-link`}>alterar</button>
            </div>
          )}

          {!showAskForGeolocation &&
            !showError &&
            isNotShowingPickupDetailsAndHasPickupOptions && (
            <div className={`${styles.pointsList} pkpmodal-points-list`}>
              {pickupOptions.map(pickupPoint => (
                <div
                  className={`${styles.pointsItem} pkpmodal-points-item`}
                  key={pickupPoint.id}>
                  <PickupPoint
                    changeActivePickupPointId={changeActivePickupPointId}
                    handleChangeActivePickupDetails={
                      changeActivePickupDetails
                    }
                    isList
                    isSelected={pickupPoint === activePickupPoint}
                    items={items}
                    logisticsInfo={logisticsInfo}
                    pickupPoint={pickupPoint}
                    pickupPointId={pickupPoint.id}
                    selectedRules={rules}
                    sellerId={sellerId}
                    shouldUseMaps={shouldUseMaps}
                    storePreferencesData={storePreferencesData}
                    togglePickupDetails={togglePickupDetails}
                  />
                </div>
              ))}
            </div>
          )}

          {!showAskForGeolocation &&
            !showError &&
            isPickupDetailsActive && (
            <PickupPointDetails
              handleChangeActiveSLAOption={changeActiveSLAOption}
              handleClosePickupPointsModal={closePickupPointsModal}
              items={items}
              logisticsInfo={logisticsInfo}
              pickupPoint={selectedPickupPoint}
              pickupPointInfo={pickupPoints.find(
                pickup => pickup.id === selectedPickupPoint.pickupPointId
              )}
              selectedRules={rules}
              sellerId={sellerId}
              storePreferencesData={storePreferencesData}
              togglePickupDetails={togglePickupDetails}
            />
          )}
        </div>
      </div>
    )
  }
}

PickupSidebar.propTypes = {
  activePickupPoint: PropTypes.object,
  askForGeolocationStatus: PropTypes.string,
  changeActivePickupDetails: PropTypes.func.isRequired,
  changeActivePickupPointId: PropTypes.func.isRequired,
  changeActiveSLAOption: PropTypes.func.isRequired,
  closePickupPointsModal: PropTypes.func.isRequired,
  errorStatus: PropTypes.string,
  geolocationFrom: PropTypes.string,
  googleMaps: PropTypes.object,
  intl: intlShape,
  isLargeScreen: PropTypes.bool,
  isLoading: PropTypes.bool.isRequired,
  isPickupDetailsActive: PropTypes.bool,
  items: PropTypes.array.isRequired,
  logisticsInfo: PropTypes.array.isRequired,
  mapStatus: PropTypes.string.isRequired,
  onAskForGeolocationStatus: PropTypes.func.isRequired,
  onGeolocationError: PropTypes.func.isRequired,
  onHandleAddressChange: PropTypes.func.isRequired,
  onHandleAskForGeolocation: PropTypes.func.isRequired,
  onManualGeolocation: PropTypes.func.isRequired,
  onManualGeolocationError: PropTypes.func.isRequired,
  pickupOptions: PropTypes.array.isRequired,
  pickupPoints: PropTypes.array.isRequired,
  rules: PropTypes.object.isRequired,
  searchAddress: AddressShapeWithValidation,
  selectedPickupPoint: PropTypes.object,
  sellerId: PropTypes.string,
  setGeolocationFrom: PropTypes.func.isRequired,
  shouldUseMaps: PropTypes.bool,
  showAskForGeolocation: PropTypes.bool,
  showError: PropTypes.bool,
  storePreferencesData: PropTypes.object.isRequired,
  togglePickupDetails: PropTypes.func.isRequired,
  updateLocationTab: PropTypes.func.isRequired,
}

export default injectIntl(PickupSidebar)

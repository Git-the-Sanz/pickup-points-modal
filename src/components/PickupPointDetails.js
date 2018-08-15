import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl, intlShape } from 'react-intl'
import { translate } from '../utils/i18nUtils'

import {
  getUnavailableItemsByPickup,
  getItemsWithPickupPoint,
} from '../utils/pickupUtils'

import PickupPoint from './PickupPoint'
import ProductItems from './ProductItems'
import PickupPointHour from './PickupPointHour'
import Button from './Button'

import './PickupPointDetails.css'

export class PickupPointDetails extends Component {
  constructor(props) {
    super(props)

    this.state = {
      unavailableItems: getUnavailableItemsByPickup(
        this.props.items,
        this.props.logisticsInfo,
        this.props.pickupPoint,
        this.props.sellerId
      ),
      items: getItemsWithPickupPoint(
        this.props.items,
        this.props.logisticsInfo,
        this.props.pickupPoint,
        this.props.sellerId
      ),
    }
  }
  handleBackButtonClick = () => this.props.togglePickupDetails()

  handleConfirmButtonClick = () => {
    this.props.handleChangeActiveSLAOption({
      slaOption: this.props.pickupPoint.id,
      sellerId: this.props.sellerId,
      shouldUpdateShippingData: false,
    })
    this.props.togglePickupDetails()
    this.props.handleClosePickupPointsModal()
  }

  render() {
    const {
      pickupPoint,
      pickupPointInfo,
      selectedRules,
      isSelectedSla,
      sellerId,
      intl,
      storePreferencesData,
      logisticsInfo,
    } = this.props

    const { unavailableItems, items } = this.state

    const bh = pickupPointInfo && pickupPointInfo.businessHours
    const daysOrder = [1, 2, 3, 4, 5, 6, 0]

    let sameWeekDaysHours
    let newBh

    if (bh && bh.length > 0) {
      newBh = []
      daysOrder.forEach((number, i) => {
        let closed = true
        const dayInfo = {
          name: translate(intl, `weekDay${number}`),
        }

        bh.forEach((day, j) => {
          if (number === day.DayOfWeek) {
            closed = false
            dayInfo.hours = bh[j].OpeningTime + bh[j].ClosingTime
            dayInfo.openingTime = bh[j].OpeningTime
            dayInfo.closingTime = bh[j].ClosingTime
          }
        })

        dayInfo.closed = closed

        newBh.push(dayInfo)
      })

      sameWeekDaysHours = true
      newBh.forEach((day, i) => {
        if (i > 0 && i < 5 && day.hours !== newBh[i - 1].hours) {
          sameWeekDaysHours = false
        }
      })

      if (sameWeekDaysHours) {
        const condensedBusinessHours = []
        condensedBusinessHours.push({
          name: translate(intl, 'weekDays'),
          closed: newBh[0].closed,
          openingTime: newBh[0].openingTime,
          closingTime: newBh[0].closingTime,
        })
        for (let i = 5; i <= 6; i++) {
          condensedBusinessHours.push({
            name: `${newBh[i].name}`,
            closed: newBh[i].closed,
            openingTime: newBh[i].openingTime,
            closingTime: newBh[i].closingTime,
          })
        }
        newBh = condensedBusinessHours
      }
    }

    return (
      <div className="pkpmodal-details">
        <div className="pkpmodal-details-top">
          <button
            className="pkpmodal-details-back-lnk btn btn-link"
            onClick={this.handleBackButtonClick}
            type="button">
            <i
              className={
                'pkpmodal-icon-back-pickup-points-list icon-angle-left'
              }
            />
            {translate(intl, 'cancelBackList')}
          </button>
        </div>

        <div className="pkpmodal-details-middle">
          <div className="pkpmodal-details-store">
            <PickupPoint
              isSelected={isSelectedSla}
              items={this.props.items}
              logisticsInfo={logisticsInfo}
              pickupPoint={pickupPoint}
              selectedRules={selectedRules}
              sellerId={sellerId}
              storePreferencesData={storePreferencesData}
            />
          </div>

          <div className="pkpmodal-details-info">
            <div className="pkpmodal-details-group">
              <h3 className="title pkpmodal-details-info-title">
                {translate(intl, 'productsInPoint')}
              </h3>
              {items && <ProductItems items={items} />}
              {unavailableItems && (
                <ProductItems isAvailable={false} items={unavailableItems} />
              )}
            </div>
            {pickupPoint.pickupStoreInfo &&
              pickupPoint.pickupStoreInfo.additionalInfo && (
                <div className="pkpmodal-details-group">
                  <h3 className="pkpmodal-details-info-title">
                    {translate(intl, 'aditionalInfo')}
                  </h3>
                  {pickupPoint.pickupStoreInfo.additionalInfo}
                </div>
              )}

            {
              newBh && (
                <div className="pkpmodal-details-group">
                  <h3 className="pkpmodal-details-info-title">
                    {translate(intl, 'businessHours')}
                  </h3>
                  <table className="pkpmodal-details-hours">
                    {
                      newBh.map((day, i) => {
                        return (
                          <tr key={i}>
                            <td className="pkpmodal-details-hours-day">{day.name}</td>
                            {
                              day.closed
                              ? (
                                <td className="pkpmodal-details-hours-closed">
                                  {translate(intl, 'closed')}
                                </td>
                              )
                              : (
                                <td className="pkpmodal-details-hours-range">
                                  <PickupPointHour time={day.openingTime} /> {translate(intl, 'hourTo')} <PickupPointHour time={day.closingTime} />
                                </td>
                              )
                            }
                          </tr>
                        )
                      })
                    }
                  </table>
                </div>
              )
            }
          </div>
        </div>

        <div className="pkpmodal-details-bottom">
          <Button
            id={`confirm-pickup-${pickupPoint.id
              .replace(/[^\w\s]/gi, '')
              .split(' ')
              .join('-')}`}
            kind="primary"
            large
            moreClassName="pkpmodal-details-confirm-btn"
            onClick={this.handleConfirmButtonClick}
            title={translate(intl, 'confirmPoint')}
          />
        </div>
      </div>
    )
  }
}

PickupPointDetails.propTypes = {
  handleChangeActiveSLAOption: PropTypes.func.isRequired,
  handleClosePickupPointsModal: PropTypes.func.isRequired,
  intl: intlShape,
  isSelectedSla: PropTypes.bool,
  items: PropTypes.array.isRequired,
  logisticsInfo: PropTypes.array.isRequired,
  onClickPickupModal: PropTypes.func,
  pickupPoint: PropTypes.object.isRequired,
  pickupPointInfo: PropTypes.object.isRequired,
  selectedRules: PropTypes.object.isRequired,
  sellerId: PropTypes.string,
  storePreferencesData: PropTypes.object.isRequired,
  togglePickupDetails: PropTypes.func.isRequired,
}

export default injectIntl(PickupPointDetails)

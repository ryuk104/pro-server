import express from 'express'
import { param } from 'express-validator'
import { HttpStatusCode } from '../../../shared/models/http/http-error-codes'
import { isSafePath } from '../../helpers/custom-validators/misc'
import { isPluginNameValid, isPluginVersionValid } from '../../helpers/custom-validators/plugins'
import { PluginManager } from '../../lib/plugins/plugin-manager'
import { areValidationErrors } from './shared'

const serveThemeCSSValidator = [
  param('themeName')
    .custom(isPluginNameValid),
  param('themeVersion')
    .custom(isPluginVersionValid),
  param('staticEndpoint')
    .custom(isSafePath),

  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (areValidationErrors(req, res)) return

    const theme = PluginManager.Instance.getRegisteredThemeByShortName(req.params.themeName)

    if (!theme || theme.version !== req.params.themeVersion) {
      return res.fail({
        status: HttpStatusCode.NOT_FOUND_404,
        message: 'No theme named ' + req.params.themeName + ' was found with version ' + req.params.themeVersion
      })
    }

    if (theme.css.includes(req.params.staticEndpoint) === false) {
      return res.fail({
        status: HttpStatusCode.NOT_FOUND_404,
        message: 'No static endpoint was found for this theme'
      })
    }

    res.locals.registeredPlugin = theme

    return next()
  }
]

// ---------------------------------------------------------------------------

export {
  serveThemeCSSValidator
}
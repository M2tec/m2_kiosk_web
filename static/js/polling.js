const addDelay = timeout => new Promise(resolve => setTimeout(resolve, timeout))

export const myReport = () => async (dispatch) => {
  dispatch({
    type: constants.DOWNLOAD_REPORT_REQUEST
  })

  let url = `/admin/dashboard/report.js?project_id=${projectId}&tool_id=${toolId}`

  let remainingPollingTime = 15000 // <--------
  try {
    const subscribe = async (uri) => {
      let response = await fetch(uri, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'x-api-token': `Bearer ${token}`
        }
      })
      const resBody = await response.json()
      if (resBody.status === 'success') {
        window.location.href = resBody.url
        dispatch({
          type: constants.DOWNLOAD_REPORT_SUCCESS
        })
      } else {
        if(remainingPollingTime <= 0) { // <--------
          dispatch({
            type: constants.SHOW_DOWNLOAD_POPUP
          })
          return
        }

        remainingPollingTime -= 5000 // <--------
        await addDelay(5000)
        await subscribe(url) 
      }
    }
    subscribe(url)
  } catch (error) {
    dispatch({
      type: constants.DOWNLOAD_REPORT_FAILURE,
      errorMessage: error.status
    })
  }
}

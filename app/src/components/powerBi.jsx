import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';

export default function PowerBI () {

    return (
        <PowerBIEmbed
            embedConfig = {{
                type: 'report',   // Supported types: report, dashboard, tile, visual, qna, paginated report and create
                id: 'd4ac67c1-11fd-4db7-a512-3c14c196dab4',
                embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=01557461-c74f-489e-8d65-f944b88a02a1&groupId=71883fb3-a5d6-4027-be35-0090c1f643d1&w=2&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVNPVVRILUNFTlRSQUwtVVMtQy1QUklNQVJZLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0IiwiZW1iZWRGZWF0dXJlcyI6eyJtb2Rlcm5FbWJlZCI6dHJ1ZSwidXNhZ2VNZXRyaWNzVk5leHQiOnRydWV9fQ%3d%3d',
                accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvM2M0YmNmNmEtNDM5NC00MjU4LTliNWQtZmUyZmQxODgwYWNiLyIsImlhdCI6MTY5MDU5NDkyMCwibmJmIjoxNjkwNTk0OTIwLCJleHAiOjE2OTA2MDAxNjIsImFjY3QiOjAsImFjciI6IjEiLCJhaW8iOiJBVFFBeS84VUFBQUEyaWY4dEExdlpWQ3BFZXFFNk90R1ZFM0U5VEM3VXpEVTc4OW84SUJHdExhRFJLUVpUMHlva0ZvTkZTeElVYm1XIiwiYW1yIjpbInB3ZCJdLCJhcHBpZCI6IjE4ZmJjYTE2LTIyMjQtNDVmNi04NWIwLWY3YmYyYjM5YjNmMyIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiaWFDZWxlIiwiZ2l2ZW5fbmFtZSI6IkFkbWluaXN0cmFkb3IiLCJpcGFkZHIiOiIxODcuMTk5Ljk3LjE3MyIsIm5hbWUiOiJBZG1pbmlzdHJhZG9yIGlhQ2VsZSIsIm9pZCI6Ijg3NTlmNTdhLTM2MzktNDIwNi1hMzIzLTRkZDgwZGE4OGFlMyIsInB1aWQiOiIxMDAzMjAwMkNBQkZDMDlFIiwicmgiOiIwLkFiMEFhczlMUEpSRFdFS2JYZjR2MFlnS3l3a0FBQUFBQUFBQXdBQUFBQUFBQUFDOUFDUS4iLCJzY3AiOiJBcHAuUmVhZC5BbGwgQ2FwYWNpdHkuUmVhZC5BbGwgQ2FwYWNpdHkuUmVhZFdyaXRlLkFsbCBDb250ZW50LkNyZWF0ZSBEYXNoYm9hcmQuUmVhZC5BbGwgRGFzaGJvYXJkLlJlYWRXcml0ZS5BbGwgRGF0YWZsb3cuUmVhZC5BbGwgRGF0YWZsb3cuUmVhZFdyaXRlLkFsbCBEYXRhc2V0LlJlYWQuQWxsIERhdGFzZXQuUmVhZFdyaXRlLkFsbCBHYXRld2F5LlJlYWQuQWxsIEdhdGV3YXkuUmVhZFdyaXRlLkFsbCBQaXBlbGluZS5EZXBsb3kgUGlwZWxpbmUuUmVhZC5BbGwgUGlwZWxpbmUuUmVhZFdyaXRlLkFsbCBSZXBvcnQuUmVhZC5BbGwgUmVwb3J0LlJlYWRXcml0ZS5BbGwgU3RvcmFnZUFjY291bnQuUmVhZC5BbGwgU3RvcmFnZUFjY291bnQuUmVhZFdyaXRlLkFsbCBUZW5hbnQuUmVhZC5BbGwgVGVuYW50LlJlYWRXcml0ZS5BbGwgVXNlclN0YXRlLlJlYWRXcml0ZS5BbGwgV29ya3NwYWNlLlJlYWQuQWxsIFdvcmtzcGFjZS5SZWFkV3JpdGUuQWxsIiwic2lnbmluX3N0YXRlIjpbImttc2kiXSwic3ViIjoiS2sySGk2OXNieFJoZXNQdkRVa2g4LVR3Um1UOFI3ZmxNeUxrUG44b2ZuRSIsInRpZCI6IjNjNGJjZjZhLTQzOTQtNDI1OC05YjVkLWZlMmZkMTg4MGFjYiIsInVuaXF1ZV9uYW1lIjoiYWRtaW5AaWFjZWxlLmNvbSIsInVwbiI6ImFkbWluQGlhY2VsZS5jb20iLCJ1dGkiOiJuT083WTRJdjVFS1Y2WENzZWJzTkFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyI2MmU5MDM5NC02OWY1LTQyMzctOTE5MC0wMTIxNzcxNDVlMTAiLCJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX3BsIjoiZXMtTVgifQ.g4USPYkeIZERxcwmR_oG0e-cEy7wCc2VBAiKdXhXSqYITqGG-axJbDyA83TOMWx9eMZS7iTV-Tu0CixmGapBVqEbCT6fDAOr-XWvB3qNeb1QydUmhjcTeCxkaOPKi95BfI_XKVrSD0z44R_e_U0gKiBW8bodo-bBbqRJEJZSLjAYfNdBYqbf6Sucxm4_QraBu0GgFVT0qSubbVoZvKg88tdLSlNEEtCXfAAHzonkx08KBkUAfddb1pAt_FJbzI0UgsW1T6mYlcI112TUyeX1nctT4eZ5AI6MDBUMsVT8u-0OJzQhVNtMf-vhjXM1JkjNarJgP5PEU7hJ3h8JC5eUbg',
                tokenType: models.TokenType.Aad, // Use models.TokenType.Aad for SaaS embed
                settings: {
                    panes: {
                        filters: {
                            expanded: false,
                            visible: false
                        }
                    },
                    background: models.BackgroundType.Transparent,
                }
            }}

            eventHandlers = {
                new Map([
                    ['loaded', function () {console.log('Report loaded');}],
                    ['rendered', function () {console.log('Report rendered');}],
                    ['error', function (event) {console.log(event.detail);}],
                    ['visualClicked', () => console.log('visual clicked')],
                    ['pageChanged', (event) => console.log(event)],
                ])
            }

            cssClassName = { "PowerBIFrame" }

            getEmbeddedComponent = { (embeddedReport) => {
                window.report = embeddedReport;
            }}
    />
    )
}